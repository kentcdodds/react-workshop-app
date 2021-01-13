// this utility helps to generate the code to use in the entry file
const fs = require('fs')
const path = require('path')
const loadFiles = require('./load-files')

function getAppInfo({cwd = process.cwd(), ignore} = {}) {
  const filesInfo = loadFiles({cwd, ignore})
  let gitHubRepoUrl
  const pkgPath = path.join(process.cwd(), 'package.json')
  try {
    const {
      repository: {url: repoUrl},
    } = require(pkgPath)
    gitHubRepoUrl = repoUrl.replace('git+', '').replace('.git', '')
  } catch (error) {
    throw new Error(
      `Cannot find a repository URL for this workshop. Check that the package.json at "${pkgPath}" has {"repository": {"url": "this should be set to a github URL"}}`,
    )
  }

  const imports = filesInfo.map(({id, filePath, ext}) => {
    let loaders = ''
    if (ext === '.html') {
      loaders = '!raw-loader!'
    } else if (ext === '.md' || ext === '.mdx') {
      loaders = '!babel-loader!mdx-loader!'
    }
    const relativePath = filePath.replace('src/', './')
    return `"${id}": () => import("${loaders}${relativePath}")`
  })

  const hasBackend =
    fs.existsSync(path.join(cwd, 'src/backend.js')) ||
    fs.existsSync(path.join(cwd, 'src/backend.ts')) ||
    fs.existsSync(path.join(cwd, 'src/backend.tsx'))

  return {gitHubRepoUrl, filesInfo, imports, hasBackend}
}

module.exports = getAppInfo
