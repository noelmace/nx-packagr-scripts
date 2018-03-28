const { basename, dirname, join } = require('path');
const { paths } = require('./constants.js');
const { copy } = require('fs-extra');
const { cleanBuilds } = require('./steps/clean');
const { getPkgJsons } = require('./steps/pkgjsons');
const { ensureConventions } = require('./steps/conventions');
const { ngPackagr } = require('ng-packagr');

/**
 * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview
 * @param {string} cwd working directory
 * @param {string} program parsed CLI arguments (@see commander)
 */
async function build(cwd, program) {
  if (!program.keep) {
    cleanBuilds(cwd);
  }

  let packages = await getPkgJsons(program.lib, cwd);

  const promises = packages.map(async pkg => {
    ensureConventions(pkg, cwd, program.debug);

    // we use [dherges/ng-packgr](https://github.com/dherges/ng-packagr) to build the library
    // we should switch to @angular-devkit/build-ng-packagr when available
    await ngPackagr()
      .forProject(pkg)
      .withTsConfig(join(cwd, 'tsconfig.json'))
      .build();
    if (program.npmrc) {
      await copy(program.npmrc, join(cwd, paths.libDist, basename(dirname(pkg)), '.npmrc'));
    }
    return pkg;
  });

  return promises.length === 1 ? promises[0] : Promise.all(promises);
}

module.exports = build;
