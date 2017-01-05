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

  subscription.request = function(pCount) {
    var count = pCount;
    while (count--) {
      let cur = this._it.next();
      if (cur.done) {
        this._observer.complete();
        break;
      } else {
        this._observer.next(cur.value);
      }
    }

    return this;
  };

  return subscription;
};

module.exports = Flowable;
