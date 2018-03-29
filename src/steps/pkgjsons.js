const {glob, fs: {access}} = require('../utils/promisified.js')
const {dirname, basename, join} = require('path')
const {paths} = require('../constants.js')

/**
 * get npm libraries package.json paths
 * @param {string} lib path to the single library from whish you need a package.json file
 * @param {string} cwd working directory
 * @returns {Promise<string>[]} package.json path(s) (just from getLibsPkgPaths if lib isn't set)
 */
async function getPkgJsons(lib, cwd) {
  if (lib) {
    const pkgJson = join(lib, 'package.json')
    try {
      await access(pkgJson)
    } catch (e) {
      throw new Error(`
There isn't any library project in ${lib}.
Please, verify that this folder exists and there is a package.json file at its root.
      `)
    }
    return [pkgJson]
  } else {
    // each library project that have a package.json at its root should be built
    // we use node-glob to get the path to this package.json files
    // except if the '-l' option have been used
    let packages = await glob(`${paths.libs}/*/package.json`, {cwd})

    if (!packages.length) {
      throw new Error(`Could not find any library.`)
    }

    if (packages.length - 1) {
      console.log(`Found ${packages.length} librarie${packages.length > 1 ? 's' : ''} :`)
      packages.forEach(pkg => console.log('\t' + basename(dirname(pkg))))
      console.log()
    }

    return packages
  }
}

module.exports = {
  getPkgJsons,
}
