'use strict';

exports.createIterable = () => ({
  [Symbol.iterator]: function() {
    return {
      data: [12, 34, 56, 78, 90],
      next: function() {
        const done = this.data.length === 0;
        const value = !done ? this.data.shift() : undefined;

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
