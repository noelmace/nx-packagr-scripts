#!/usr/bin/env node

const program = require('commander')
const build = require('./src/build.js')
const publish = require('./src/publish.js')
const { join } = require('path')

program
    .version(require(join(__dirname, 'package.json')).version)
    .description(
        'Build and publish libraries in libs/ with a package.json file in Angular Package Format'
        + 'see @nrwl/schematics for more informations on Nx schematics'
    ).option('-l, --lib [lib]', 'define a unique lib folder to build', false)
    .option('-d, --debug', 'debug mode', false)
    .option('-p, --path', 'project\'s root folder (. by default)')

const cwd = program.path || process.cwd()

program.command('build')
    .option('-f, --force', 'return 0 even if an error occured', false)
    .option('-k, --keep', 'keep previously built npm-libs', false)
    .description('build libraries')
    .action(async () => {
        try {
            const rslt = await build(cwd, program)
            const msg = Array.isArray(rslt)
                ? 'All libraries from libs/ were successfully built.'
                    + 'You can now publish them from the dist/libs/<project> folders.'
                : `${rslt} were successfully built.`
                    + `You can now publish it from the dist/libs/${basename(dirname(rslt))} folder.`
            console.log(msg)
            process.exit(0)
        } catch (e) {
            console.error(program.debug ? e : (e.message || e))
            program.force ? process.exit(0) : process.exit(1)
        }
    })

program.command('publish')
    .description('publish prebuilt libraries')
    .option('-n, --dry-run', 'do everything except actually publish the packages', false)
    .action(async () => {
        try {
            const rslt = await publish(cwd, program)
            console.log(`${Array.isArray(rslt)
                ? 'All previously buildt libraries were'
                : rslt + ' has been'
                } successfully published.`
            )
            process.exit(0)
        } catch(e) {
            console.error(program.debug ? e : (e.message || e))
            process.exit(1)
        }
    })

program.parse(process.argv)


