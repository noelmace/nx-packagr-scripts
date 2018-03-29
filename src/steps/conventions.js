const semver = require('semver')
const {dirname, basename, join} = require('path')
const {libDestFolder} = require('../constants.js')

// Ensure that the destination folder is a "libName" subfolder of the configured "libDestFolder"
function buildDest({packageJson, libName, errorMessage}) {
  const dest = packageJson.ngPackage.dest
  const conventionDest = `${libDestFolder}/${libName}`
  if (!dest || dest !== conventionDest) {
    throw new Error(errorMessage(`${dest} should be ${conventionDest}`))
  }
}

// the package.json file can not specify any devDependency
function devDependencies({packageJson, errorMessage}) {
  if (packageJson.devDependencies) {
    throw new Error(errorMessage(`You should not specify any devDependency in this file.`))
  }
}

// each lib's dependency should be satisfied by a global dependency
function satisfiedDependencies({packageJson, errorMessage, cwd, debug}) {
  const getDependencies = (pkg) => ({
    ...pkg.dependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  })

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
 * Ensure that our conventions on npm libraries are respected
 * throw an error if not
 * @param {string} pkg path to the library's package.json file
 * @param {string} cwd working directory
 * @param {boolean} [debug=false] complete information on error reasons (slower solution)
 */
function ensureConventions(pkg, cwd, debug = false) {
  const params = {
    libName: basename(dirname(pkg)),
    errorMessage: (msg) => `${pkg} does not follow the conventions.`
      + `\n${msg}`
      + `\n${basename(dirname(pkg))} build process has been aborted.`,
    packageJson: require(join(cwd, pkg)),
    pkg, cwd, debug
  }

  buildDest(params)
  devDependencies(params)
  satisfiedDependencies(params)
}

module.exports = {
  ensureConventions,
}
