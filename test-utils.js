if (process.cwd() === __dirname) {
  // we're running local tests in this case, so don't use dist
  module.exports = require('./src/test-utils')
} else {
  module.exports = require('./dist/test-utils')
}
