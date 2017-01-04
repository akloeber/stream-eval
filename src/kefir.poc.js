'use strict';

const Kefir = require('kefir');
const common = require('./common.poc');

const stream = Kefir.stream(emitter => {

  for (let x of common.createIterable()) {
    emitter.emit(x);
  }
  emitter.end();
});

stream
  .bufferWithCount(common.CHUNK_SIZE)
  //.spy()
  .flatMapConcat(x => Kefir.fromCallback(callback => {
    console.log('ASYNC START', x);
    setTimeout(() => {
      console.log('ASYNC COMPLETE', x);
      callback(x);
    }, common.DURATION_ASYNC_TASK);

    /*
    // NOTE: Kefir.fromPromise can not be used as Promise starts immediately after creation
    return Kefir.fromPromise(new Promise(pResolve => {
      console.log('ASYNC START', x);
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        pResolve(x);
      }, common.DURATION_ASYNC_TASK);
    }));
    */
  }))
  .toPromise()
  .then(() => console.log('DONE'));
