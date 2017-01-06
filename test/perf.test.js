'use strict';

/* eslint no-invalid-this:0, no-undef:0, no-unused-vars:0 */

const Benchmark = require('benchmark');

const common = require('../src/common.poc');

const _ = require('highland');
const Rx = require('rx');
const RxJS = require('rxjs');

const COUNT = 20000;
const CHUNK_SIZE = 2000;
const DURATION_ASYNC_TASK = 0;

const DATA = [];
for (let idx = 0; idx < COUNT; idx++) {
  DATA[idx] = Math.floor(Math.random() * 1000);
}

const ITERABLE = common.createIterable({data: DATA, quiet: true});

new Benchmark.Suite('Stream performance')
.add('Highland', {
  fn: function(deferred) {
    new Promise(function(resolve, reject) {
      _(ITERABLE)
        .batch(CHUNK_SIZE)
        .flatMap(x => _(new Promise(pResolve => {
          process.nextTick(() => pResolve(x));
        })))
        .last()
        .toCallback((err, result) => err ? reject(err) : resolve(result));
    })
    .then(() => deferred.resolve())
    .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('RxJS 4', {
  fn: function(deferred) {
    // TODO: use Flowable
    const stream = Rx.Observable.from(ITERABLE).controlled();
    stream.request(CHUNK_SIZE);

    stream
      .bufferWithCount(CHUNK_SIZE)
      .selectMany(
        x => new Promise(resolve => process.nextTick(() => resolve(x)))
        .then(val => {
          stream.request(CHUNK_SIZE);
          return val;
        })
      )
      .toPromise()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('RxJS 5', {
  fn: function(deferred) {
    // TODO: use Flowable
    const stream = RxJS.Observable.from(ITERABLE);

    stream
      .bufferCount(CHUNK_SIZE)
      .mergeMap(x => new Promise(resolve => process.nextTick(() => resolve(x))), null, 1)
      .toPromise()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.on('error', function(event) {
  console.error('ERROR:', event.target.error, event.target.error.stack);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log(`Fastest is '${this.filter('fastest').map('name')}'`);
})
.run({ 'async': true });
