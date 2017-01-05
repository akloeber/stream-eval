'use strict';

/* eslint no-invalid-this:0, no-undef:0, no-unused-vars:0 */

const Benchmark = require('benchmark');
const common = require('../src/common.poc');
const _ = require('highland');

const COUNT = 20000;
const CHUNK_SIZE = 2000;
const DURATION_ASYNC_TASK = 0;

const DATA = [];
for (let idx = 0; idx < COUNT; idx++) {
  DATA[idx] = Math.floor(Math.random() * 1000);
}

const ITERABLE = common.createIterable({data: DATA, quiet: true});

new Benchmark.Suite('Iteration over Array')
.add('highland', {
  fn: function(deferred) {
    new Promise(function(resolve, reject) {
      _(ITERABLE)
        .batch(CHUNK_SIZE)
        .flatMap(x => {
          return _(new Promise(pResolve => {
            setTimeout(() => {
              pResolve(x);
            }, DURATION_ASYNC_TASK);
          }));
        })
        .last()
        .toCallback((err, result) => {
          if(err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    })
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
