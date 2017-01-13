'use strict';

const Observable = require('zen-observable');

function Flowable(iterable) {
  this._iterable = iterable;

  Observable.call(this, observer => {});
}

Flowable.prototype = Object.create(Observable.prototype);
Flowable.prototype.constructor = Flowable;

Flowable.prototype.subscribe = function(observer) {
  const subscription = Observable.prototype.subscribe.call(this, observer);

  subscription._it = this._iterable[Symbol.iterator]();
  subscription._done = false;

  subscription.request = function(count) {

    if (!this._done) {
      process.nextTick(emitTask, this, count);
    }

    return this;
  };

  return subscription;
};

module.exports = Flowable;

function emitTask(subscription, n) {
  var count = n;
  while (count--) {
    let cur = subscription._it.next();
    if (cur.done) {
      subscription._done = true;
      subscription._observer.complete();
      break;
    } else {
      subscription._observer.next(cur.value);
    }
  }
}
