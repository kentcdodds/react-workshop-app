const {execSync} = require('child_process')
const resolve = require('resolve')

module.exports = filePath =>
  execSync(
    `postcss "${resolve
      .sync(filePath, {
        basedir: process.cwd(),
      })
      .replace(/\\/g, '/')}" --use cssnano --no-map`,
  ).toString()
