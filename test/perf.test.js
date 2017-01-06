'use strict';

/* eslint no-invalid-this:0, no-undef:0, no-unused-vars:0 */

const Benchmark = require('benchmark');

const common = require('../src/common.poc');
const Flowable = require('../src/Flowable');

const _ = require('highland');
const Rx = require('rx');
const RxJS = require('rxjs');
const Kefir = require('kefir');
const most = require('most');
const mostSubject = require('most-subject');
const transducers = require('transducers-js');

const COUNT = 20000;
const CHUNK_SIZE = 2000;
const DURATION_ASYNC_TASK = 0;

const DATA = [];
for (let idx = 0; idx < COUNT; idx++) {
  DATA[idx] = Math.floor(Math.random() * 1000);
}

const ITERABLE = common.createIterable({data: DATA, quiet: true});
const FLOW = new Flowable(ITERABLE);

new Benchmark.Suite('Stream performance')
.add('Highland [back pressure]', {
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
.add('RxJS 4 [flow control on stream]', {
  fn: function(deferred) {
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
.add('RxJS 4 [flow control on source]', {
  fn: function(deferred) {
    var sub;

    Rx.Observable
      .create(observer => {
        sub = FLOW.subscribe({
          next: (x) => observer.onNext(x),
          complete: () => observer.onCompleted()
        });
        sub.request(CHUNK_SIZE);
      })
      .bufferWithCount(CHUNK_SIZE)
      .selectMany(
        x => new Promise(resolve => process.nextTick(() => resolve(x)))
        .then(val => {
          sub.request(CHUNK_SIZE);
          return val;
        })
      )
      .toPromise()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('RxJS 5 [no flow control]', {
  fn: function(deferred) {
    RxJS.Observable
      .from(ITERABLE)
      .bufferCount(CHUNK_SIZE)
      .mergeMap(x => new Promise(resolve => process.nextTick(() => resolve(x))), null, 1)
      .toPromise()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('RxJS 5 [flow control on source]', {
  fn: function(deferred) {
    var sub;

    RxJS.Observable
      .create(observer => {
        sub = FLOW.subscribe({
          next: (x) => observer.next(x),
          complete: () => observer.complete()
        });
        sub.request(CHUNK_SIZE);
      })
      .bufferCount(CHUNK_SIZE)
      .mergeMap(
        x => new Promise(resolve => process.nextTick(() => resolve(x)))
        .then(val => {
          sub.request(CHUNK_SIZE);
          return val;
        })
      )
      .toPromise()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('Kefir [flow control on source]', {
  fn: function(deferred) {
    var sub;

    Kefir
      .stream(emitter => {
        sub = FLOW.subscribe({
          next: (x) => emitter.emit(x),
          complete: () => emitter.end()
        });
        sub.request(CHUNK_SIZE);
      })
      .bufferWithCount(CHUNK_SIZE)
      .flatMap(
        x => Kefir.fromPromise(new Promise(resolve => process.nextTick(() => resolve(x)))
        .then(val => {
          sub.request(CHUNK_SIZE);
          return val;
        }))
      )
      .toPromise()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('Most.js [no flow control]', {
  fn: function(deferred) {
    most.from(ITERABLE)
      .transduce(transducers.partitionAll(CHUNK_SIZE))
      .concatMap(x => most.fromPromise(new Promise(resolve => process.nextTick(() => resolve(x)))))
      .drain()
      .then(() => deferred.resolve())
      .catch(err => deferred.reject(err));
  },
  defer: true
})
.add('Most.js [flow control on source]', {
  fn: function(deferred) {
    const subject = mostSubject.async();
    const sub = FLOW.subscribe({
      next: (x) => subject.next(x),
      complete: () => subject.complete()
    });
    sub.request(CHUNK_SIZE);

    subject
      .transduce(transducers.partitionAll(CHUNK_SIZE))
      .concatMap(
        x => most.fromPromise(new Promise(resolve => process.nextTick(() => resolve(x)))
        .then(val => {
          sub.request(CHUNK_SIZE);
          return val;
        }))
      )
      .drain()
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
