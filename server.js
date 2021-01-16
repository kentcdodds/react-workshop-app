if (process.cwd() === __dirname) {
  // we're running local tests in this case, so don't use dist
  module.exports = require('./src/server')
} else {
  module.exports = require('./dist/server')
}
