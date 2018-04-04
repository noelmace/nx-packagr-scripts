# packagr-for-nx (pk4nx)

ng-packagr CLI for nrwl/nx projects

## Objective

_This tool is only intended to be temporary, given that this feature should be covered by nrwl/nx or another schematics._

For more informations, see the following issues :

* [Nrwl/nx : Add ability to publish multiple libraries from a single nx workspace](https://github.com/nrwl/nx/issues/225)

## Usage

`npm install --dev packagr-for-nx`

Then, run `pk4nx --help` to output the usage informations.

    Usage: pk4nx [options] [command]

    ng-packagr CLI for Nrwl/Nx projects

    Options:

        -V, --version         output the version number
        -l, --lib [lib]       define a unique lib folder to build or publish (default: false)
        -d, --debug           debug mode
        -p, --path [path]     Nx project's root folder (. by default)
        -f, --force           return 0 even if an error occured
        -k, --keep            keep previously built npm-libs
        -rc, --npmrc [npmrc]  [build] path to an .npmrc publish configuration to had in the lib build folder (default: false)
        -n, --dry-run         [publish] do everything except actually publish the packages
        -h, --help            output usage information

    Commands:

        build                 build libraries
        publish               publish prebuilt libraries

## Conventions

In addition with the ones followed by nrwl/nx, you need to respect the following conventions in your project :

* each "npm library" should have a package.json file at his root, or it will be ignored
* this file should define a ngPackage.dest property set to ../../dist/npm-libs/<lib-name>
* each dependency specified in this file should be satisfied by one in the monorepository root package.json file
* this file should not define any devDependency
