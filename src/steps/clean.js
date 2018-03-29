const {paths} = require('../constants.js')
const {remove} = require('fs-extra')
const {join} = require('path')

/**
 * delete the libraries dist folders
 */
async function cleanBuilds(cwd) {
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

module.exports = {
  cleanBuilds,
}
