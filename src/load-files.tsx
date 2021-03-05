import path from 'path'
import fs from 'fs'
import glob from 'glob'
import type {FileInfo} from './types'

function loadFiles({cwd = process.cwd(), ...rest} = {}): Array<FileInfo> {
  const fileInfo = glob
    .sync('src/{exercise,final,examples}/*.+(js|html|jsx|ts|tsx|md|mdx)', {
      cwd,
      ...rest,
    })
    // eslint-disable-next-line complexity
    .map(filePath => {
      const fullFilePath = path.join(cwd, filePath)
      const {dir, name, ext} = path.parse(fullFilePath)
      const parentDir = path.basename(dir)
      const contents = String(fs.readFileSync(fullFilePath))
      let type = parentDir
      if (ext === '.md' || ext === '.mdx') {
        type = 'instruction'
      }
      const [firstLine, secondLine = ''] = contents.split(/\r?\n/)
      let title = 'Unknown'
      let extraCreditTitle = 'Unknown'
      const isExtraCredit = name.includes('.extra-')
      const fallbackMatch = {groups: {title: ''}}
      if (parentDir === 'final' || parentDir === 'exercise') {
        if (ext === '.js' || ext === '.tsx' || ext === '.ts') {
          const titleMatch =
            firstLine.match(/\/\/ (?<title>.*)$/) ?? fallbackMatch
          title = titleMatch.groups?.title.trim() ?? title
          const extraCreditTitleMatch =
            secondLine.match(/\/\/ 💯 (?<title>.*)$/) ?? fallbackMatch
          extraCreditTitle =
            extraCreditTitleMatch.groups?.title.trim() ?? extraCreditTitle
        } else if (ext === '.html') {
          const titleMatch =
            firstLine.match(/<!-- (?<title>.*) -->/) ?? fallbackMatch
          title = titleMatch.groups?.title.trim() ?? title
          const extraCreditTitleMatch =
            secondLine.match(/<!-- 💯 (?<title>.*) -->/) ?? fallbackMatch
          extraCreditTitle =
            extraCreditTitleMatch.groups?.title.trim() ?? extraCreditTitle
        } else if (ext === '.md' || ext === '.mdx') {
          const titleMatch = firstLine.match(/# (?<title>.*)$/) ?? fallbackMatch
          title = titleMatch.groups?.title.trim() ?? title
        }
      }
      return {
        id: filePath,
        title,
        fullFilePath,
        filePath,
        isolatedPath: filePath.replace('src', '/isolated'),
        ext,
        filename: name,
        type,
        number: Number((name.match(/(^\d+)/) ?? [null])[0]),
        isExtraCredit,
        extraCreditNumber: Number((name.match(/(\d+$)/) ?? [null])[0]),
        extraCreditTitle,
      }
    })

  fileInfo.sort((a, b) => {
    // change order so that shorter file names (01) are before longer (01.extra-01)
    if (a.filename.startsWith(b.filename)) return 1
    if (b.filename.startsWith(a.filename)) return -1
    // otherwise preserve order from glob (use explicit condition for consistency in Node 10)
    return a.id > b.id ? 1 : a.id < b.id ? -1 : 0
  })

  return fileInfo
}

export {loadFiles}

// wrote the code before enabling the rule and didn't want to rewrite the code...
/*
eslint
  @typescript-eslint/prefer-regexp-exec: "off",
*/
