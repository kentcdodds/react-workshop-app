if (process.cwd() === __dirname) {
  // we're running local tests in this case, so don't use dist
  module.exports = require('./src/setup-tests')
} else {
  module.exports = require('./dist/setup-tests')
}
