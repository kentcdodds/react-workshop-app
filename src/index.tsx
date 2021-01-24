import type {SetupWorkerApi} from 'msw'
import preval from 'preval.macro'
import React from 'react'
import ReactDOM from 'react-dom'
import {createBrowserHistory} from 'history'
import {setup as setupServer} from './server'
import {renderReactApp} from './react-app'
import type {
  FileInfo,
  LazyComponents,
  Imports,
  Backend,
  DynamicImportFn,
  DefaultDynamicImportFn,
} from './types'

const styleTag = document.createElement('style')
const requiredStyles = [
  preval`module.exports = require('../other/css-file-to-string')('normalize.css/normalize.css')`,
  preval`module.exports = require('../other/css-file-to-string')('./other/workshop-app-styles.css')`,
  // this will happen when running the regular app and embedding the example
  // in an iframe.
  // pretty sure the types are wrong on this one... (It's been fixed in TS 4.2)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  window.frameElement
    ? `#root{display:grid;place-items:center;height:100vh;}`
    : '',
].join('\n')
styleTag.appendChild(document.createTextNode(requiredStyles))
document.head.prepend(styleTag)

const fillScreenCenter = `padding:30px;min-height:100vh;display:grid;align-items:center;justify-content:center;`

const originalDocumentElement = document.documentElement

function makeKCDWorkshopApp({
  imports,
  filesInfo,
  projectTitle,
  backend,
  options = {},
  ...otherWorkshopOptions
}: {
  imports: Imports
  filesInfo: Array<FileInfo>
  projectTitle: string
  backend?: Backend
  options?: {
    concurrentMode?: boolean
  }
} & {
  gitHubRepoUrl: string
}) {
  // if I we don't do this then HMR can sometimes call this function again
  // which would result in the app getting mounted multiple times.
  let rootEl = document.getElementById('root')
  if (rootEl) {
    rootEl.innerHTML = ''
  }

  const lazyComponents: LazyComponents = {}

  const componentExtensions = ['.js', '.md', '.mdx', '.tsx', '.ts']

  for (const {ext, filePath} of filesInfo) {
    if (componentExtensions.includes(ext)) {
      lazyComponents[filePath] = React.lazy(
        moduleWithDefaultExport(imports, filePath),
      )
    }
  }

  if (backend) {
    const {
      handlers,
      quiet = true,
      serviceWorker = {url: '/mockServiceWorker.js'},
      ...rest
    } = backend
    const server = setupServer({handlers}) as SetupWorkerApi
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-void
      void server.start({
        quiet,
        serviceWorker,
        ...rest,
      })
    }
  }

  const history = createBrowserHistory()

  let previousLocation = history.location
  let previousIsIsolated: boolean | null = null

  function render(ui: React.ReactElement, el: HTMLElement): VoidFunction {
    if (options.concurrentMode) {
      /* eslint-disable */
      // @ts-expect-error I don't care enough to be type safe here
      const root = (ReactDOM.unstable_createRoot || ReactDOM.createRoot)(el)
      root.render(ui)
      return function unmount() {
        root.unmount()
      }
      /* eslint-enable */
    } else {
      ReactDOM.render(ui, el)

      return function unmount() {
        ReactDOM.unmountComponentAtNode(el)
      }
    }
  }

  function escapeForClassList(name: string) {
    // classList methods don't allow space or `/` characters
    return encodeURIComponent(name.replace(/\//g, '_'))
  }

  function handleLocationChange(location = history.location) {
    const {pathname} = location
    // add location pathname to classList of the body
    document.body.classList.remove(
      escapeForClassList(previousLocation.pathname),
    )
    document.body.classList.add(escapeForClassList(pathname))

    // set the title to have info for the exercise
    const isIsolated = pathname.startsWith('/isolated')
    let info: FileInfo | undefined
    if (isIsolated) {
      const filePath = pathname.replace('/isolated', 'src')
      info = filesInfo.find(i => i.filePath === filePath)
    } else {
      const number = Number(pathname.split('/').slice(-1)[0])
      info = filesInfo.find(
        i => i.type === 'instruction' && i.number === number,
      )
    }

    if (isIsolated && !info) {
      document.body.innerHTML = `
        <div style="${fillScreenCenter}">
          <div>
            Sorry... nothing here. To open one of the exercises, go to
            <code>\`/exerciseNumber\`</code>, for example:
            <a href="/1"><code>/1</code></a>
          </div>
        </div>
      `
      return
    }

    // I honestly have no clue why, but there appears to be some kind of
    // race condition here with the title. It seems to get reset to the
    // title that's defined in the index.html after we set it :shrugs:
    setTimeout(() => {
      document.title = [
        info
          ? [
              info.number ? `${info.number}. ` : '',
              info.title || info.filename,
            ].join('')
          : null,
        projectTitle,
      ]
        .filter(Boolean)
        .join(' | ')
    }, 20)

    if (isIsolated && info) {
      renderIsolated(moduleWithDefaultExport(imports, info.filePath))
    } else if (previousIsIsolated !== isIsolated) {
      // if we aren't going from isolated to the app, then we don't need
      // to bother rendering react anew. The app will handle that.
      renderReact()
    }
    previousLocation = location
    previousIsIsolated = isIsolated
  }

  let unmount: ((el: HTMLElement) => void) | undefined

  function renderIsolated(isolatedModuleImport: DynamicImportFn) {
    rootEl = document.getElementById('root')
    if (!rootEl) return
    unmount?.(rootEl)

    void isolatedModuleImport().then(async ({default: defaultExport}) => {
      if (history.location !== previousLocation) {
        // location has changed while we were getting the module
        // so don't bother doing anything... Let the next event handler
        // deal with it
        return
      }
      if (typeof defaultExport === 'function') {
        // regular react component.
        rootEl = document.getElementById('root')
        if (rootEl) {
          unmount = render(React.createElement(defaultExport), rootEl)
        } else {
          // eslint-disable-next-line no-alert
          window.alert(
            'This document has no div with the ID of "root." Please add one... Or bug Kent about it...',
          )
        }
      } else if (typeof defaultExport === 'string') {
        // HTML file
        const domParser = new DOMParser()
        const newDocument = domParser.parseFromString(
          defaultExport,
          'text/html',
        )
        document.documentElement.replaceWith(newDocument.documentElement)

        // to get all the scripts to actually run, you have to create new script
        // elements, and no, cloneElement doesn't work unfortunately.
        // Apparently, scripts will only get loaded/run if you use createElement.
        const scripts = Array.from(document.querySelectorAll('script'))
        const loadingScriptsQueue = []
        for (const script of scripts) {
          // if we're dealing with an inline script, we need to wait for all other
          // scripts to finish loading before we run it
          if (!script.hasAttribute('src')) {
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(loadingScriptsQueue)
          }
          // replace the script
          const newScript = document.createElement('script')
          for (const attrName of script.getAttributeNames()) {
            newScript.setAttribute(
              attrName,
              script.getAttribute(attrName) ?? '',
            )
          }
          newScript.innerHTML = script.innerHTML
          script.parentNode?.insertBefore(newScript, script)
          script.parentNode?.removeChild(script)

          // if the new script has a src, add it to the queue
          if (script.hasAttribute('src')) {
            loadingScriptsQueue.push(
              new Promise(resolve => {
                newScript.onload = resolve
              }),
            )
          }
        }

        // now make sure all src scripts are loaded before continuing
        await Promise.all(loadingScriptsQueue)

        // Babel will call this when the DOMContentLoaded event fires
        // but because the content has already loaded, that event will never
        // fire, so we'll run it ourselves
        if (window.Babel) {
          window.Babel.transformScriptTags()
        }
      }

      // otherwise we'll just expect that the file ran the thing it was supposed
      // to run and doesn't need any help.
    })
  }

  function renderReact() {
    if (document.documentElement !== originalDocumentElement) {
      document.documentElement.replaceWith(originalDocumentElement)
    }
    unmount = renderReactApp({
      history,
      projectTitle,
      filesInfo,
      lazyComponents,
      render,
      ...otherWorkshopOptions,
    })
  }

  history.listen(handleLocationChange)
  // kick it off to get us started
  handleLocationChange()
}

function moduleWithDefaultExport(imports: Imports, filePath: string) {
  const importFn = imports[filePath]
  if (!importFn) throw new Error(`'${filePath}' does not exist in imports.`)

  if (filePath.match(/\.(mdx?|html)$/))
    return importFn as DefaultDynamicImportFn

  const promiseOfModule = importFn()
  const promiseOfDefault: ReturnType<DefaultDynamicImportFn> = promiseOfModule
    .then(module => {
      const Component = module.App ?? module.default
      if (typeof Component !== 'function') {
        throw new Error(
          'Please add `export {App}` or `export default Component` to your exercise file to render it.',
        )
      }
      return {default: Component}
    })
    .catch((error: Error) => {
      console.error(filePath, error)
      return {
        default: () => <div>{error.message}</div>,
      }
    })

  return () => promiseOfDefault
}
export {makeKCDWorkshopApp}

/*
eslint
  babel/no-unused-expressions: "off",
  @typescript-eslint/no-explicit-any: "off",
  @typescript-eslint/prefer-regexp-exec: "off",
  react/jsx-no-useless-fragment: "off",
  no-void: "off"
*/
