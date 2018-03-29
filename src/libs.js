const {paths, libDestFolder} = require('./constants.js')
const {glob, fs: {access}} = require('./utils/promisified.js')
const {remove} = require('fs-extra')
const {dirname, basename, join} = require('path')
const semver = require('semver')

/**
 * delete the libraries dist folders
 */
async function removeLibDist(cwd) {
  try {
    // you need to make sure that every libs/*/package.json ngPackage.dest is set to ../../dist/npm-libs/<lib-name>
    // see checkConvention()
    await remove(join(cwd, paths.libDist))
    console.log(`\nThe ${paths.libDist} folder has been successfully deleted.\n`)
  } catch (e) {
    console.error(`An error occured during the deletion of the ${paths.libDist} folder.`)
    console.error('You can delete manually the required folder and then run this script with the -k option.')
    throw new Error(e);
  }
}

/**
 * Ensure that our conventions on npm libraries are respected
 * @param {string} pkg path to the library's package.json file
 * @param {string} cwd working directory
 * @param {boolean} [debug=false] complete information on error reasons (slower solution)
 */
async function ensureConventions(pkg, cwd, debug = false) {
  const libName = basename(dirname(pkg))
  const errorMessage = (msg) => `${pkg} does not follow the conventions.
${msg}
${libName} build process has been aborted.`

  const packageJson = require(join(cwd, pkg))

  // Ensure that the destination folder is a "libName" subfolder of the configured "libDestFolder"
  const dest = packageJson.ngPackage.dest
  const conventionDest = `${libDestFolder}/${libName}`
  if (!dest || dest !== conventionDest) {
    throw new Error(errorMessage(`${dest} should be ${conventionDest}`))
  }

  // the package.json file can not specify any devDependency
  if (packageJson.devDependencies) {
    throw new Error(errorMessage(`You should not specify any devDependency in this file.`))
  }

  const getDependencies = (pkg) => ({
    ...pkg.dependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  })

  // each lib's dependency should be satisfied by a global dependency
  const rootDependencies = getDependencies(require(join(cwd, 'package.json')))
  const dependencies = Object.entries(getDependencies(packageJson))
  let isVersionOk = true;
  if (debug) {
    console.log(`debug dependencies:`)
    console.log(`\t${'dependency'.padEnd(30)}root\tproject`)
    dependencies.forEach(([dependency, version]) => {
      const rootVersion = rootDependencies[dependency];
      const test = semver.satisfies(rootVersion, version)
      isVersionOk = isVersionOk && test;
      if (!test) {
        console.log(`\t${dependency.padEnd(30)}${rootVersion || 'none'}\t${version}`)
      }
    })
    console.log()
  } else {
    isVersionOk = dependencies.every(([dependency, version]) => {return semver.satisfies(rootDependencies[dependency], version)})
  }

  if (!isVersionOk) {
    throw new Error(errorMessage(`Every dependency should be consistent with the root package.json.`))
  }
}

/**
 * get all npm libraries package.json paths
 * @param {string} cwd working directory
 * @returns {Promise<string>[]}
 */
async function getLibsPkgPaths(cwd) {
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

/**
 * wrap getLibsPkgPaths to permit to use a parameter to manually set a single library folder path
 * @param {string} lib path to the single library from whish you need a package.json file
 * @param {string} cwd working directory
 * @returns {Promise<string>[]} package.json path(s) (just from getLibsPkgPaths if lib isn't set)
 */
async function conditionnalGetLibs(lib, cwd) {
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
    return getLibsPkgPaths(cwd)
  }
}

module.exports = {
  removeLibDist,
  getLibsPkgPaths,
  ensureConventions,
  conditionnalGetLibs,
}
