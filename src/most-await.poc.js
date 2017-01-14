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
  .map(x => {
    console.log('ASYNC START', x);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
        //reject(new Error('some error'));
      }, common.DURATION_ASYNC_TASK);
    }).then(() => flow.emit(common.CHUNK_SIZE));
  })
  .await()
  .drain()
  .then(() => console.log('DONE'))
  .catch(err => console.log('ERR', err));
