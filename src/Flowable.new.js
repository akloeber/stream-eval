'use strict';

const Observable = require('zen-observable');

function Flowable(iterable) {
  this._observers = [];
  this._it = iterable[Symbol.iterator]();
  this._done = false;

  Observable.call(this, observer => {
    const idx = this._observers.push(observer) - 1;

    return () => {
      this._observers.splice(idx, 1);
    };
  });
}

Flowable.prototype = Object.create(Observable.prototype);
Flowable.prototype.constructor = Flowable;

Flowable.prototype.emit = function(n) {

  if (!this._done) {
    process.nextTick(emitTask, this, n);
  }

  return this;
};

module.exports = Flowable;

function emitTask(_flowable, _n) {
  var count = _n;
  const it = _flowable._it;
  const observers = _flowable._observers;

  while (count--) {
    let cur = it.next();
    if (cur.done === true) {
      broadcastComplete(observers);
      _flowable._done = true;
      break;
    } else {
      broadcastNext(observers, cur.value);
    }
  }
}

function broadcastComplete(observers) {
  for (var idx = 0, len = observers.length; idx < len; idx++) {
    observers[idx].complete();
  }
}

function broadcastNext(observers, val) {
  for (var idx = 0, len = observers.length; idx < len; idx++) {
    observers[idx].next(val);
  }
}
