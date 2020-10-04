const {execSync} = require('child_process')
const path = require('path')
const resolve = require('resolve')

module.exports = filePath =>
  execSync(
    `postcss "${resolve
      .sync(filePath, {
        basedir: process.cwd(),
      })
      .split(path.sep)
      .join('/')}" --use cssnano --no-map`,
  ).toString()
