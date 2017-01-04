'use strict';

const most = require('most');
const transducers = require('transducers-js');

const common = require('./common.poc');

most.from(common.createIterable())
  //.tap(x => console.log('READ', x))
  .transduce(transducers.partitionAll(common.CHUNK_SIZE))
  .concatMap(x => {
    console.log('ASYNC START', x);
    return most.fromPromise(new Promise(resolve => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
      }, common.DURATION_ASYNC_TASK);
    }));
  })
  .drain()
  .then(() => console.log('DONE'));
