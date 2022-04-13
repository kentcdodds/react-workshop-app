const jestConfig = require('kcd-scripts/jest')

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    ...jestConfig.moduleNameMapper,
    '\\.css$': 'identity-obj-proxy',
  },
  coverageThreshold: {
    global: {
      statements: 25,
      branches: 25,
      lines: 25,
      functions: 25,
    },
  },
}
