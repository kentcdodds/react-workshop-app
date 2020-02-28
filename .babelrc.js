module.exports = api => {
  api.cache(true)
  const babelConfig = require('kcd-scripts/babel')(api)
  babelConfig.plugins.push('babel-plugin-dynamic-import-node')
  return babelConfig
}
