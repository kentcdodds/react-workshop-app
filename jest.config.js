const jestConfig = require('kcd-scripts/jest')

module.exports = {
  ...jestConfig,
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      lines: 60,
      functions: 60,
    },
  },
}
