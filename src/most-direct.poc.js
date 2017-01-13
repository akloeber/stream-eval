'use strict';

const most = require('most');
const mostChunksOf = require('most-chunksOf');

const common = require('./common.poc');

const chunksOf = mostChunksOf.chunksOf;
most.Stream.prototype.chunksOf = function (n) {
  return chunksOf(n, this);
};

const ITERABLE = common.createIterable();

most
  .from(ITERABLE)
  .chunksOf(common.CHUNK_SIZE)
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
