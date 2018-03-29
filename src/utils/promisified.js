/// Take every error-first callback style dependencies, and export them in a
/// version that returns promises using Node 8 LTS Util.promisify :
/// https://nodejs.org/docs/latest-v8.x/api/util.html

const Util = require('util')
const {toCamelCase} = require('./strings.js')

// all the dependencies to exports when promisified
const dependencies = new Map([
  // dependencies with just one function as module.exports
  ['glob', false],
  ['resolve-bin', false],
  // dependencies with multiple functions to promisify
  ['fs', ['access']],
])

dependencies.forEach((functions, mod) => {
  const dependency = require(mod)

  let toExport

  if (functions) {
    functions.forEach(fct => {toExport[fct] = Util.promisify(dependency[fct])})
  } else {
    toExport = Util.promisify(dependency)
  }

  module.exports[toCamelCase(mod)] = toExport
})
