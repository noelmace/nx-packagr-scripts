const { basename, dirname, join } = require('path');
const { libName, conditionnalGetLibs } = require('./libs.js')
const { paths } = require('./constants.js')
const { fs: { access } } = require('./promisified.js')
const { spawn } = require('./exec.js')

/**
 * publish all previously buildt libraries
 * @param {string} cwd working directory
 * @param {string} program parsed CLI arguments (@see commander)
 * @see build.js
 */
async function publish(cwd, program) {

  let packages = await conditionnalGetLibs(program.lib, cwd)

  const promises = packages.map(async pkg => {
    const prefix = basename(dirname(pkg))
    const folder = join(cwd, paths.libDist, prefix)
    let rslt = dirname(pkg)
    await access(folder)
    program.dryRun
      ? console.log(`[Dry-run] npm publish from ${folder} directory - nothing to do`)
      : rslt = await spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['publish'], { prefix: !!(packages.length-1) && prefix }, { cwd: folder })
    return rslt
  })

  return promises.length === 1 ? promises[0] : Promise.all(promises);
}

module.exports = publish
