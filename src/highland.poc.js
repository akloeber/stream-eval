'use strict';

const _ = require('highland');
const common = require('./common.poc');

new Promise(function(resolve, reject) {
  _(common.createIterable())
    .batch(common.CHUNK_SIZE)
    .flatMap(x => {
      return _(new Promise((pResolve, pReject) => {
        console.log('ASYNC START', x);
        setTimeout(() => {
          console.log('ASYNC COMPLETE', x);
          pResolve(x);
          //pReject(new Error('some error'));
        }, common.DURATION_ASYNC_TASK);
      }));
    })
    .last()
    //.tap(x => console.log('TAP', x))
    .toCallback((err, result) => {
      if(err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
})
.then(() => console.log('DONE'))
.catch(err => console.log('ERROR', err));
