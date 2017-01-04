'use strict';

const _ = require('highland');
const common = require('./common.poc');

// const CONCURRENCY = 1; // can be achieved via stream#parallel()

new Promise(function(resolve,reject) {
  _(common.createIterable())
    //.tap(x => console.log('READ', x))
    .batch(common.CHUNK_SIZE)
    .map(x => {
      console.log('ASYNC START', x);
      return _(new Promise(pResolve => {
        setTimeout(() => {
          console.log('ASYNC COMPLETE', x);
          pResolve(x);
        }, common.DURATION_ASYNC_TASK);
      }));
    })
    .sequence()
    .collect()
    .toCallback((err, result) => {
      if(err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
})
.then(() => console.log('DONE'));
