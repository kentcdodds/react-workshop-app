module.exports = (on, config) => {
  const isDev = config.watchForFileChanges
  config.baseUrl = isDev ? 'http://localhost:3000' : 'http://localhost:8080'
  return config
}
