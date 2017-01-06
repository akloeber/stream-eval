'use strict';

const RxJS = require('rxjs');
const common = require('./common.poc');
const Flowable = require('./Flowable');

const CONCURRENCY = 1;

const flow = new Flowable(common.createIterable());

var sub;

const stream = RxJS.Observable.create(observer => {
  sub = flow.subscribe({
    next: (x) => observer.next(x),
    complete: () => observer.complete()
  });
  sub.request(common.CHUNK_SIZE);
});

stream
  .bufferCount(common.CHUNK_SIZE)
  .mergeMap(x => {
    console.log('ASYNC START', x);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
      }, common.DURATION_ASYNC_TASK);
    }).then(val => {
      sub.request(common.CHUNK_SIZE);
      return val;
    });
  })
  .toPromise()
  .then(lastVal => console.log('DONE', lastVal));
