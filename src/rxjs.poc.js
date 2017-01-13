'use strict';

const RxJS = require('rxjs');
const common = require('./common.poc');
const Flowable = require('./Flowable.new');

const flow = new Flowable(common.createIterable());

RxJS.Observable
  .from(flow.emit(common.CHUNK_SIZE))
  .bufferCount(common.CHUNK_SIZE)
  .mergeMap(x => {
    console.log('ASYNC START', x);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
      }, common.DURATION_ASYNC_TASK);
    })
    .then(() => flow.emit(common.CHUNK_SIZE));
  })
  .toPromise()
  .then(() => console.log('DONE'));
