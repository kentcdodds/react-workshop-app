const path = require('path')
const fs = require('fs')
const glob = require('glob')

function loadFiles({
  cwd = process.cwd(),
  ignore = ['**/__tests__/**', '**/test/**', 'backend.js'],
  ...rest
} = {}) {
  const fileInfo = glob
    .sync('src/**/*.*', {cwd, ignore, ...rest})
    // eslint-disable-next-line complexity
    .map(filePath => {
      const fullFilePath = path.join(cwd, filePath)
      const {dir, name, ext} = path.parse(fullFilePath)
      const parentDir = path.basename(dir)
      const contents = String(fs.readFileSync(fullFilePath))
      let type = parentDir
      if (name.includes('.extra-')) {
        type = 'extraCredit'
      }
      if (ext === '.md' || ext === '.mdx') {
        type = 'instruction'
      }
      const [firstLine, secondLine] = contents.split('\n')
      let title, extraCreditTitle
      const fallbackMatch = {groups: {title: ''}}
      if (parentDir === 'final' || parentDir === 'exercise') {
        if (ext === '.js' || ext === '.tsx' || ext === '.ts') {
          const titleMatch =
            firstLine.match(/\/\/ (?<title>.*)$/) || fallbackMatch
          title = titleMatch.groups.title.trim()
          const extraCreditTitleMatch =
            secondLine.match(/\/\/ 💯 (?<title>.*)$/) || fallbackMatch
          extraCreditTitle = extraCreditTitleMatch.groups.title.trim()
        } else if (ext === '.html') {
          const titleMatch =
            firstLine.match(/<!-- (?<title>.*) -->/) || fallbackMatch
          title = titleMatch.groups.title.trim()
          const extraCreditTitleMatch =
            secondLine.match(/<!-- 💯 (?<title>.*) -->/) || fallbackMatch
          extraCreditTitle = extraCreditTitleMatch.groups.title.trim()
        } else if (ext === '.md' || ext === '.mdx') {
          const titleMatch = firstLine.match(/# (?<title>.*)$/) || fallbackMatch
          title = titleMatch.groups.title.trim()
        }
      }
      return {
        id: filePath,
        fullFilePath,
        filePath,
        isolatedPath: filePath.replace('src', '/isolated'),
        ext,
        filename: name,
        type,
        number: Number((name.match(/(^\d+)/) || [null])[0]),
        extraCreditNumber: Number((name.match(/(\d+$)/) || [null])[0]),
        title,
        extraCreditTitle,
      }
    })

  return fileInfo
}

module.exports = loadFiles
