'use strict';

const Rx = require('rxjs');
const common = require('./common.poc');

const CONCURRENCY = 1;

var request;

const it = common.createIterable()[Symbol.iterator]();
const stream = Rx.Observable.create(function subscribe(observer) {

  request = function(pCount) {
    var count = pCount;
    while (count-- > 0) {
      let cur = it.next();
      if (cur.done) {
        observer.complete();
        break;
      } else {
        observer.next(cur.value);
      }
    }
  };
});

stream
  //.do(x => console.log('READ', x))
  .map(x => `(${x})`)
  .bufferCount(common.CHUNK_SIZE)
  .mergeMap(x => {
    console.log('ASYNC START', x);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
        request(common.CHUNK_SIZE * CONCURRENCY);
      }, common.DURATION_ASYNC_TASK);
    });
  })
  .toPromise()
  .then(lastVal => console.log('DONE', lastVal));

request(common.CHUNK_SIZE * CONCURRENCY);
