const jestConfig = require('kcd-scripts/jest')

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    ...jestConfig.moduleNameMapper,
    '\\.css$': 'identity-obj-proxy',
  },
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 30,
      lines: 30,
      functions: 30,
    },
  },
}
