'use strict';

const Rx = require('rxjs');
const common = require('./common.poc');

const CONCURRENCY = 1;

const stream = Rx.Observable.from(common.createIterable());

// ATTENTION: no back-pressure support, so all values are read at once and buffered internally
stream
  //.do(x => console.log('READ', x))
  .map(x => `(${x})`)
  .bufferCount(common.CHUNK_SIZE)
  .mergeMap(
    x => {
      console.log('ASYNC START', x);
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('ASYNC COMPLETE', x);
          resolve(x);
        }, common.DURATION_ASYNC_TASK);
      });
    },
    null,
    CONCURRENCY
  )
  .toPromise()
  .then(lastVal => console.log('DONE', lastVal));
