const { Transform } = require('stream');

/**
 * take a node stream and add a prefix  to each line
 * @example child.stdout.pipe(prepend('process a')).pipe(process.stdout)
 * @param {string} prefixStr will be used to set the prefix string '[prefixStr]: '
 */
module.exports = function prepend(prefixStr) {
  const prefix = Buffer.from(`[${prefixStr}]: `);

  function transform(chunk, encoding, done) {
    this._rest = this._rest && this._rest.length ? Buffer.concat([this._rest, chunk]) : chunk;

    let index;

    // As long as we keep finding newlines, keep making slices of the buffer and push them to the
    // readable side of the transform stream
    while ((index = this._rest.indexOf('\n')) !== -1) {
      // The `end` parameter is non-inclusive, so increase it to include the newline we found
      const line = this._rest.slice(0, ++index);
      // `start` is inclusive, but we are already one char ahead of the newline -> all good
      this._rest = this._rest.slice(index);
      // We have a single line here! Prepend the string we want
      this.push(Buffer.concat([prefix, line]));
    }

    return void done();
  }

  // Called before the end of the input so we can handle any remaining
  // data that we have saved
  function flush(done) {
    // If we have any remaining data in the cache, send it out
    if (this._rest && this._rest.length) {
      return void done(null, Buffer.concat([prefix, this._rest]));
    }
  }

  return new Transform({ transform, flush });
};
