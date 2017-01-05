'use strict';

const DATA = [12, 34, 56, 78, 90];

exports.createIterable = () => ({
  [Symbol.iterator]: function() {
    return {
      _data: DATA,
      _count: DATA.length,
      _idx: 0,
      next: function() {
        const done = this._idx === this._count;
        const value = !done ? this._data[this._idx++] : undefined;

        console.log(done ? 'IT END' : `IT VALUE ${value}`);

        return {
          value: value,
          done: done
        };
      }
    };
  }
});

exports.DURATION_ASYNC_TASK = 1000;
exports.CHUNK_SIZE = 2;
