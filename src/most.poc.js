'use strict';

const most = require('most');
const mostChunksOf = require('most-chunksOf');

const common = require('./common.poc');
const Flowable = require('./Flowable.new');

const chunksOf = mostChunksOf.chunksOf;
most.Stream.prototype.chunksOf = function (n) {
  return chunksOf(n, this);
};

const flow = new Flowable(common.createIterable());

most
  .from(flow.emit(common.CHUNK_SIZE))
  .chunksOf(common.CHUNK_SIZE)
  .concatMap(x => {
    console.log('ASYNC START', x);
    return most.fromPromise(
      new Promise(resolve => {
        setTimeout(() => {
          console.log('ASYNC COMPLETE', x);
          resolve(x);
        }, common.DURATION_ASYNC_TASK);
      })
      .then(() => flow.emit(common.CHUNK_SIZE))
    );
  })
  .drain()
  .then(() => console.log('DONE'));
