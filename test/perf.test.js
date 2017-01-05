'use strict';

/* eslint no-invalid-this:0, no-undef:0, no-unused-vars:0 */

const Benchmark = require('benchmark');
const common = require('../src/common.poc');
const _ = require('highland');

const BENCH_OPTS = {
  defer: true,
  setup: function() {
    console.log('SETUP', this);
    var ITERABLE = common.createIterable();
  },
  teardown: function() {},
  context: {
    COUNT: 1000,
    CHUNK_SIZE: 2,
    DURATION_ASYNC_TASK: 0
  }
};

new Benchmark.Suite('Iteration over Array')
.add('highland', function(deferred) {
  console.log('TEST', this.benchmark.compiled);
  console.log('TEST', this.benchmark.context);
  console.log('TEST', typeof ITERABLE);

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
}, BENCH_OPTS)
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
