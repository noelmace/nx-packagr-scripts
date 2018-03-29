/// Global constants
module.exports = {
  // used as a constant for conventions (this is ways it's not in 'paths')
  libDestFolder: '../../dist/npm-libs',
  // put all your paths here in order to avoid "magic" strings
  paths: {
    // by convention, we never add a final / to the paths
    libDist: 'dist/npm-libs',
    libs: 'libs',
    npmRc: 'scripts/assets/.npmrc',
  },
}
