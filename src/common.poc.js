'use strict';

const DATA = [12, 34, 56, 78, 90];

exports.createIterable = opts => {
  const cfg = Object.assign({
    data: DATA,
    quiet: false
  }, opts);

  return {
    [Symbol.iterator]: function() {
      return {
        _data: cfg.data,
        _count: cfg.data.length,
        _tap: !cfg.quiet,
        _idx: 0,
        next: function() {
          const done = this._idx === this._count;
          const value = !done ? this._data[this._idx++] : undefined;

          this._tap && console.log(done ? 'IT END' : `IT VALUE ${value}`);

          return {
            value: value,
            done: done
          };
        }
      };
    }
  };
};

exports.DURATION_ASYNC_TASK = 1000;
exports.CHUNK_SIZE = 2;
