'use strict';

const most = require('most');
const mostSubject = require('most-subject');
const mostChunksOf = require('most-chunksOf');
//const transducers = require('transducers-js');

const common = require('./common.poc');
const Flowable = require('./Flowable');

const chunksOf = mostChunksOf.chunksOf;
most.Stream.prototype.chunksOf = function (n) {
  return chunksOf(n, this);
};

const flow = new Flowable(common.createIterable());

const subject = mostSubject.async();
const sub = flow.subscribe({
  next: (x) => subject.next(x),
  complete: () => subject.complete()
});
sub.request(common.CHUNK_SIZE);

subject
  //.tap(x => console.log('READ', x))
  //.transduce(transducers.partitionAll(common.CHUNK_SIZE))
  .chunksOf(common.CHUNK_SIZE)
  .concatMap(x => {
    console.log('ASYNC START', x);
    return most.fromPromise(new Promise(resolve => {
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        resolve(x);
      }, common.DURATION_ASYNC_TASK);
    })
    .then(val => {
      sub.request(common.CHUNK_SIZE);
      return val;
    }));
  })
  .drain()
  .then(() => console.log('DONE'));
