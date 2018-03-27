const { basename, dirname, join } = require('path')
const { spawnNodeBin } = require('./exec.js');
const { glob } = require('./promisified.js')
const { appVersion, paths } = require('./constants.js')
const { removeLibDist, ensureConventions, conditionnalGetLibs } = require('./libs.js')
const { copy } = require('fs-extra')

const { exit } = process;

/**
 * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview
 */
async function build(cwd, program) {
  if(!program.keep) {
    removeLibDist(cwd)
  }

  let packages = await conditionnalGetLibs(program.lib, cwd)

  const promises = packages.map(async (pkg) => {
    let dest;
    await ensureConventions(pkg, cwd, program.debug);
    // we use [dherges/ng-packgr](https://github.com/dherges/ng-packagr) to build the library
    // we should switch to @angular-devkit/build-ng-packagr when available
    await spawnNodeBin(join(cwd, 'node_modules', 'ng-packagr', 'cli', 'main.js'), ['-p', pkg], { prefix: !!(packages.length-1) && basename(dirname(pkg)) })
    if(program.npmrc) {
      await copy(program.npmrc, join(cwd, paths.libDist, basename(dirname(pkg)), '.npmrc'))
    }
    return pkg
  })

  return promises.length === 1 ? promises[0] : Promise.all(promises);
}

module.exports = build
