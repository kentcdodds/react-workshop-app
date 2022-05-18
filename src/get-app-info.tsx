// this utility helps to generate the code to use in the entry file
import fs from 'fs'
import path from 'path'
import {loadFiles} from './load-files'
import type {FileInfo} from './types'

function getAppInfo({cwd = process.cwd()}: {cwd?: string} = {}): {
  gitHubRepoUrl: string
  filesInfo: Array<FileInfo>
  imports: Array<string>
  hasBackend: boolean
} {
  const filesInfo = loadFiles({cwd})
  let gitHubRepoUrl
  const pkgPath = path.join(process.cwd(), 'package.json')
  try {
    const {
      repository: {url: repoUrl},
    } = require(pkgPath) as {repository: {url: string}}
    gitHubRepoUrl = repoUrl.replace('git+', '').replace('.git', '')
  } catch (error: unknown) {
    throw new Error(
      `Cannot find a repository URL for this workshop. Check that the package.json at "${pkgPath}" has {"repository": {"url": "this should be set to a github URL"}}`,
    )
  }

  const imports = filesInfo.map(({id, filePath, ext}) => {
    let loaders = ''
    if (ext === '.html') {
      loaders = '!raw-loader!'
      // } else if (ext === '.md' || ext === '.mdx') {
      //   loaders = '!babel-loader!@mdx-js/loader!'
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

export {getAppInfo}

/*
eslint
  @typescript-eslint/no-var-requires: "off",
*/
