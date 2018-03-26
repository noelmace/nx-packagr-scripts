/**
 * publish all previously buildt libraries
 * @see build.js
 */
async function publish(cwd, program) {

  let packages = await conditionnalGetLibs(program.lib, cwd)

  const promises = packages.map(async pkg => {
    const prefix = basename(dirname(pkg))
    const cwd = join(cwd, paths.libDist, prefix)
    let rslt = dirname(pkg)
    await access(cwd)
    program.dryRun
      ? console.log(`[Dry-run] npm publish from ${cwd} directory - nothing to do`)
      : rslt = await spawn('npm', ['publish'], { prefix: !!(packages.length-1) && prefix }, { cwd })
    return rslt
  })

  return promises.length === 1 ? promises[0] : Promise.all(promises);
}

module.exports = publish
