'use strict';

const Rx = require('rx');
const common = require('./common.poc');

const stream = Rx.Observable
  .from(common.createIterable(), el => `(${el})`)
  .controlled();

stream
  .bufferWithCount(common.CHUNK_SIZE)
  .selectMany(x => {
    console.log('ASYNC START', x);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
      }, common.DURATION_ASYNC_TASK);
    })
    .then(val => {
      stream.request(common.CHUNK_SIZE);
      return val;
    });
  })
  .toPromise()
  .then(lastVal => console.log('DONE', lastVal));

stream.request(common.CHUNK_SIZE);
