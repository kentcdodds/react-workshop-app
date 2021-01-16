if (process.cwd() === __dirname) {
  // we're running local tests in this case, so don't use dist
  module.exports = require('./src/codegen').getCode
} else {
  module.exports = require('./dist/codegen').getCode
}
