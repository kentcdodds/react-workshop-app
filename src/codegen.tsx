// this generates the code to use in the entry file
import {getAppInfo} from './get-app-info'

function getCode({
  cwd = process.cwd(),
  ignore,
  options,
}: {
  cwd?: string
  ignore?: Array<string>
  options?: Record<string, unknown>
} = {}) {
  const {gitHubRepoUrl, filesInfo, hasBackend, imports} = getAppInfo({
    cwd,
    ignore,
  })
  return `
import {makeKCDWorkshopApp} from '@kentcdodds/react-workshop-app'
import {loadDevTools} from '@kentcdodds/react-workshop-app/dev-tools'
import pkg from '../package.json'
${hasBackend ? `import * as backend from './backend'` : ''}

if (module.hot) module.hot.accept()

const filesInfo = ${JSON.stringify(filesInfo, null, 2)}

loadDevTools(() => {
  makeKCDWorkshopApp({
    imports: {
      ${imports.join(',\n      ')}
    },
    filesInfo,
    projectTitle: pkg.title,
    gitHubRepoUrl: \`${gitHubRepoUrl}\`,
    ${hasBackend ? `backend,` : ''}
    ${options ? `options: ${JSON.stringify(options)},` : ''}
  })
})`.trim()
}

export {getCode}
