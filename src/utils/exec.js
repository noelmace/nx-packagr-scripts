const childProcess = require('child_process');
const prepend = require('./prepend.js');

/**
 * execute a binary as if from the command line
 *
 * this is a wrapper around child_process.spawn :
 *    - automatically handle outputs redirections
 *    - transform ChildProcess events to a promise
 *
 * @param {string} binPath
 * @param {string[]} args
 * @param {Object} options
 * @param {boolean} options.silent Whether to output to STDERR and STDOUT.
 * @param {string} options.errMessage If an error happens, this will replace the standard error.
 * @param {string} options.prefix prefix to add to stderr and stdout
 * @param {Object} spawnOptions {@link https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options|spawn 'options' argument}
 * @returns {Promise} resolve on child_process.spawn 'close' event
 */
async function spawn(binPath, args, { silent, prefix, errMessage }, spawnOptions = {}) {
  const spawned = childProcess.spawn(binPath, args, spawnOptions);

  // redirect the child process output
  if (!silent) {
    let { stdout, stderr } = spawned;

    if (prefix) {
      [stdout, stderr] = [stdout, stderr].map(stream => stream.pipe(prepend(prefix)));
    }

    stdout.pipe(process.stdout);
    stderr.pipe(process.stdout);
  }

  return new Promise((fulfill, reject) => {
    spawned.on('close', code => {
      if (code != 0) {
        if (errMessage === undefined) {
          reject(new Error('Process failed with code ' + code));
        } else {
          reject(new Error(errMessage));
        }
      } else {
        fulfill();
      }
    });
  });
}

/**
 * Execute an NPM Bin, by resolving the binary path then executing it. These are
 * binaries that are normally in the `./node_modules/.bin` directory, but their name might differ
 * from the package. Examples are typescript, ngc and gulp itself.
 * @param {Object} options @see spawn
 */
async function spawnNodeBin(binPath, args = [], options = {}, nodeArgs = [], spawnOptions = {}) {
  // Execute the node binary within a new child process using spawn.
  // The binary needs to be `node` because on Windows the shell cannot determine the correct
  // interpreter from the shebang.
  if (options.debug) {
    console.log([binPath].concat(args).join(' '));
  }
  return spawn('node', nodeArgs.concat([binPath]).concat(args), options, spawnOptions);
}

module.exports = {
  spawn,
  spawnNodeBin
};
