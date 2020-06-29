import preval from 'preval.macro'
import React from 'react'
import ReactDOM from 'react-dom'
import {createBrowserHistory} from 'history'
import {renderReactApp} from './react-app'

const styleTag = document.createElement('style')
const requiredStyles = [
  preval`module.exports = require('../other/css-file-to-string')('normalize.css/normalize.css')`,
  preval`module.exports = require('../other/css-file-to-string')('./other/workshop-app-styles.css')`,
].join('\n')
styleTag.appendChild(document.createTextNode(requiredStyles))
document.head.prepend(styleTag)

const fillScreenCenter = `padding:30px;min-height:100vh;display:grid;align-items:center;justify-content:center;`

const originalDocumentElement = document.documentElement

function makeKCDWorkshopApp({imports, filesInfo, projectTitle, options = {}}) {
  const lazyComponents = {}

  const componentExtensions = ['.js', '.md', '.mdx', '.tsx']

  for (const {ext, filePath} of filesInfo) {
    if (componentExtensions.includes(ext)) {
      lazyComponents[filePath] = React.lazy(imports[filePath])
    }
  }

  const history = createBrowserHistory()

  let previousLocation = history.location
  let previousIsIsolated = null

  function render(ui, el) {
    if (options.concurrentMode) {
      const root = (ReactDOM.unstable_createRoot || ReactDOM.createRoot)(el)
      root.render(ui)
      return function unmount() {
        root.unmount()
      }
    } else {
      ReactDOM.render(ui, el)

      return function unmount() {
        ReactDOM.unmountComponentAtNode(el)
      }
    }
  }

  function handleLocationChange(location = history.location) {
    const {pathname} = location
    // add location pathname to classList of the body
    document.body.classList.remove(
      previousLocation.pathname.replace(/\//g, '_'),
    )
    document.body.classList.add(pathname.replace(/\//g, '_'))

    // set the title to have info for the exercise
    const isIsolated = pathname.startsWith('/isolated')
    let info
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

    if (isIsolated) {
      renderIsolated(imports[info.filePath])
    } else if (previousIsIsolated !== isIsolated) {
      // if we aren't going from isolated to the app, then we don't need
      // to bother rendering react anew. The app will handle that.
      renderReact()
    }
    previousLocation = location
    previousIsIsolated = isIsolated
  }

  let unmount

  function renderIsolated(isolatedModuleImport) {
    unmount?.(document.getElementById('root'))

    isolatedModuleImport().then(async ({default: defaultExport}) => {
      if (history.location !== previousLocation) {
        // locaiton has changed while we were getting the module
        // so don't bother doing anything... Let the next event handler
        // deal with it
        return
      }
      if (typeof defaultExport === 'function') {
        // regular react component.
        unmount = render(
          React.createElement(defaultExport),
          document.getElementById('root'),
        )
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
            newScript.setAttribute(attrName, script.getAttribute(attrName))
          }
          newScript.innerHTML = script.innerHTML
          script.parentNode.insertBefore(newScript, script)
          script.parentNode.removeChild(script)

          // if the new script has a src, add it to the queue
          if (script.hasAttribute('src')) {
            loadingScriptsQueue.push(
              new Promise(resolve => (newScript.onload = resolve)),
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
      imports,
      options,
      render,
    })
  }

  history.listen(handleLocationChange)
  // kick it off to get us started
  handleLocationChange()
}

export default makeKCDWorkshopApp

/*
eslint
  react/prop-types: "off",
  babel/no-unused-expressions: "off",
*/
