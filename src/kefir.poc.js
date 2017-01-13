'use strict';

const Kefir = require('kefir');
const common = require('./common.poc');
const Flowable = require('./Flowable.new');

const flow = new Flowable(common.createIterable()).emit(common.CHUNK_SIZE);

Kefir
  .stream(emitter => {
    flow.subscribe({
      next: (x) => emitter.emit(x),
      complete: () => emitter.end()
    });
  })
  .bufferWithCount(common.CHUNK_SIZE)
  //.spy()
  .flatMap(x => Kefir.fromPromise(
    new Promise(pResolve => {
      console.log('ASYNC START', x);
      setTimeout(() => {
        console.log('ASYNC COMPLETE', x);
        pResolve(x);
      }, common.DURATION_ASYNC_TASK);
    })
    .then(() => flow.emit(common.CHUNK_SIZE))
  ))
  .toPromise()
  .then(() => console.log('DONE'));
