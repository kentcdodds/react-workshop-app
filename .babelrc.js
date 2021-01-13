module.exports = {
  presets: ['kcd-scripts/babel'],
  plugins: [
    process.env.NODE_ENV === 'test' ? 'babel-plugin-dynamic-import-node' : null,
  ].filter(Boolean),
}
