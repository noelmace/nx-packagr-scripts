function toCamelCase(str) {
  return str.replace(/^[_.\- ]+/, '')
            .toLowerCase()
            .replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase())
}

module.exports = {
  toCamelCase,
}
