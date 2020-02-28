module.exports = api => {
  api.cache(false)
  const babelConfig = require('kcd-scripts/babel')(api)
  babelConfig.plugins.push('babel-plugin-dynamic-import-node')
  return babelConfig
}
