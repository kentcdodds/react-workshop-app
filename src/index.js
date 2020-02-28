import preval from 'preval.macro'
import React from 'react'
import ReactDOM from 'react-dom'
import {createBrowserHistory} from 'history'
import hackFetch from './hack-fetch'

const workshopStyles = preval`module.exports = require('../other/css-file-to-string')('./other/workshop-app-styles.css')`
const normalizeStyles = preval`module.exports = require('../other/css-file-to-string')('normalize.css/normalize.css')`

const styleTag = document.createElement('style')
styleTag.innerHTML = `${normalizeStyles}${workshopStyles}`
document.head.prepend(styleTag)

function createKCDWorkshopApp({
  imports,
  filesInfo,
  projectTitle,
  fakeFetchResponses,
  renderOptions,
}) {
  if (fakeFetchResponses) {
    hackFetch(fakeFetchResponses)
  }

  const lazyComponents = {}

  for (const {ext, filePath} of filesInfo) {
    if (ext === '.js') {
      lazyComponents[filePath] = React.lazy(imports[filePath])
    }
  }

  const history = createBrowserHistory()
  window.appHistory = history

  let previousLocation = history.location

  function handleLocationChange(location = history.location) {
    const {pathname} = location
    // add location pathname to classList of the body
    document.body.classList.remove(
      previousLocation.pathname.replace(/\//g, '_'),
    )
    document.body.classList.add(pathname.replace(/\//g, '_'))

    // set the title to have info for the exercise
    const isIsolated = pathname.startsWith('/isolated')
    const filePath = pathname.replace('/isolated', 'src')

    document.title = [
      projectTitle,
      isIsolated
        ? pathname.replace('/isolated/', '')
        : pathname.split('/').slice(-1)[0],
    ]
      .filter(Boolean)
      .join(' | ')

    if (isIsolated) {
      renderIsolated(imports[filePath])
    } else {
      renderReact()
    }
    previousLocation = location
  }

  const rootEl = document.getElementById('⚛')
  let unmount

  function renderIsolated(isolatedModuleImport) {
    unmount?.(rootEl)
    rootEl.innerHTML = `
      <div style={{height: '100vh'}} className="totally-centered">
        Loading...
      </div>
    `
    isolatedModuleImport().then(async ({default: defaultExport}) => {
      if (typeof defaultExport === 'function') {
        ReactDOM.render(React.createElement(defaultExport), rootEl)
      } else if (typeof defaultExport === 'string') {
        document.documentElement.innerHTML = defaultExport

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
    })
  }

  function renderReact() {
    unmount?.(rootEl)
    rootEl.innerHTML = `
      <div style={{height: '100vh'}} className="totally-centered">
        Loading...
      </div>
    `
    import('./react-app').then(reactApp => {
      unmount = reactApp.renderReactApp({
        projectTitle,
        filesInfo,
        lazyComponents,
        renderOptions,
      })
    })
  }

  history.listen(handleLocationChange)
  // kick it off to get us started
  handleLocationChange()
}

export default createKCDWorkshopApp

/*
eslint
  react/prop-types: "off",
  babel/no-unused-expressions: "off",
*/
