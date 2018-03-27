#!/usr/bin/env node

const program = require('commander')
const build = require('./src/build.js')
const publish = require('./src/publish.js')
const { join, basename, dirname } = require('path')

program
    .version(require(join(__dirname, 'package.json')).version)
    .description(
        'ng-packagr CLI for Nrwl/Nx projects'
    ).option('-l, --lib [lib]', 'define a unique lib folder to build or publish', false)
    .option('-d, --debug', 'debug mode', false)
    .option('-p, --path [path]', 'Nx project\'s root folder (. by default)')
    .option('-f, --force', 'return 0 even if an error occured', false)
    .option('-k, --keep', 'keep previously built npm-libs', false)
    .option('--npmrc [npmrc]', '[build] path to an .npmrc publish configuration to had in the lib build folder', false)
    .option('-n, --dry-run', '[publish] do everything except actually publish the packages', false)


const cwd = program.path || process.cwd()

program.command('build')
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


