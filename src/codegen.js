// this generates the code to use in the entry file

const loadFiles = require('./load-files')

function getCode({cwd = process.cwd(), ignore, options} = {}) {
  const filesInfo = loadFiles({cwd, ignore})

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

  return `
import makeWorkshopApp from '@kentcdodds/react-workshop-app'
import pkg from '../package.json'

const filesInfo = ${JSON.stringify(filesInfo, null, 2)}

makeWorkshopApp({
  imports: {
    ${imports.join(',\n    ')}
  },
  filesInfo,
  projectTitle: pkg.title,
  ${options ? `options: ${JSON.stringify(options)}` : ''}
})`.trim()
}

module.exports = getCode
