'use strict';

const Kefir = require('kefir');
const common = require('./common.poc');
const Flowable = require('./Flowable');

const flow = new Flowable(common.createIterable());

var sub;
const stream = Kefir.stream(emitter => {
  sub = flow.subscribe({
    next: (x) => emitter.emit(x),
    complete: () => emitter.end()
  });
});

stream
  .bufferWithCount(common.CHUNK_SIZE)
  //.spy()
  .flatMap(x => Kefir.fromPromise(new Promise(pResolve => {
    console.log('ASYNC START', x);
    setTimeout(() => {
      console.log('ASYNC COMPLETE', x);
      pResolve(x);
      sub.request(common.CHUNK_SIZE);
    }, common.DURATION_ASYNC_TASK);
  })))
  .toPromise()
  .then(() => console.log('DONE'));

sub.request(common.CHUNK_SIZE);
