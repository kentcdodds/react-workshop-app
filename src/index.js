import 'focus-visible' // polyfill for :focus-visible (https://github.com/WICG/focus-visible)
import preval from 'preval.macro'
import React from 'react'
import ReactDOM from 'react-dom'
import {createBrowserHistory} from 'history'
import hackFetch from './hack-fetch'
import {renderReactApp} from './react-app'

const styleTag = document.createElement('style')
styleTag.innerHTML = [
  preval`module.exports = require('../other/css-file-to-string')('./other/workshop-app-styles.css')`,
  preval`module.exports = require('../other/css-file-to-string')('normalize.css/normalize.css')`,
  preval`module.exports = require('../other/css-file-to-string')('@reach/tabs/styles.css')`,
].join('\n')
document.head.prepend(styleTag)

const originalHTML = document.documentElement.innerHTML

function makeKCDWorkshopApp({
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
    if (ext === '.js' || ext === '.md' || ext === '.mdx') {
      lazyComponents[filePath] = React.lazy(imports[filePath])
    }
  }

  const history = createBrowserHistory()
  window.appHistory = history

  let previousLocation = history.location
  let previousIsIsolated = null

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

    // I honestly have no clue why, but there appears to be some kind of
    // race condition here with the title. It seems to get reset to the
    // title that's defined in the index.html after we set it :shrugs:
    setTimeout(() => {
      document.title = [
        info ? `${info.number}. ${info.title || info.filename}` : null,
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
    flushApp()
    if (!isolatedModuleImport) {
      document.body.innerHTML = `
        <div class="fill-screen-center">
          <div>
            Sorry... nothing here. To open one of the exercises, go to
            <code>\`/exerciseNumber\`</code>, for example:
            <a href="/1"><code>/1</code></a>
          </div>
        </div>
      `
      return
    }

    isolatedModuleImport().then(async ({default: defaultExport}) => {
      if (typeof defaultExport === 'function') {
        ReactDOM.render(
          <div className="fill-screen-center">
            {React.createElement(defaultExport)}
          </div>,
          document.getElementById('⚛'),
        )
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
    flushApp()
    unmount = renderReactApp({
      history,
      projectTitle,
      filesInfo,
      lazyComponents,
      imports,
      renderOptions,
    })
  }

  function flushApp() {
    document.documentElement.innerHTML = originalHTML
    unmount?.(document.getElementById('⚛'))
    document.getElementById('⚛').innerHTML = `
      <div class="fill-screen-center">
        Loading...
      </div>
    `
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
