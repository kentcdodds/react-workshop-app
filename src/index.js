import preval from 'preval.macro'
import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {hijackEffects} from 'stop-runaway-react-effects'
import hackFetch from './hack-fetch'

const workshopStyles = preval`module.exports = require('../other/css-file-to-string')('./other/workshop-app-styles.css')`
const normalizeStyles = preval`module.exports = require('../other/css-file-to-string')('normalize.css/normalize.css')`

const styleTag = document.createElement('style')
styleTag.innerHTML = `${normalizeStyles}${workshopStyles}`
document.head.prepend(styleTag)

function createKCDWorkshopApp({
  getExerciseImport,
  getFinalImport,
  getExampleImport,
  exerciseInfo,
  projectTitle,
  fakeFetchResponses,
  stopRunawayEffects = true,
}) {
  if (fakeFetchResponses) {
    hackFetch(fakeFetchResponses)
  }
  if (process.env.NODE_ENV !== 'production' && stopRunawayEffects) {
    hijackEffects()
  }

  for (const id in exerciseInfo) {
    const info = exerciseInfo[id]
    info.exercise.Component = React.lazy(getExerciseImport(id))
    info.final.Component = React.lazy(getFinalImport(id))
  }

  const history = createBrowserHistory()
  window.appHistory = history

  function handleAnchorClick(event) {
    if (event.metaKey || event.shiftKey) {
      return
    }
    event.preventDefault()
    history.push(event.target.closest('a').getAttribute('href'))
  }

  function ComponentContainer({label, ...props}) {
    return (
      <div>
        <h2 style={{textAlign: 'center'}}>{label}</h2>
        <div
          style={{
            flex: 1,
            padding: 20,
            border: '1px solid',
            display: 'grid',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          {...props}
        />
      </div>
    )
  }

  function ExtraCreditLinks({exerciseId}) {
    const {extraCreditTitles} = exerciseInfo[exerciseId]
    if (!extraCreditTitles) {
      return null
    }

    return (
      <div style={{gridColumn: 'span 2'}}>
        {`💯 Extra Credits: `}
        {Object.entries(extraCreditTitles).map(([id, title], index, array) => (
          <span key={id}>
            <a
              href={`/isolated/exercises-final/${exerciseId}-extra.${id}`}
              onClick={handleAnchorClick}
            >
              {title}
            </a>
            {array.length - 1 === index ? null : ' | '}
          </span>
        ))}
      </div>
    )
  }

  function ExerciseContainer() {
    const {exerciseId} = useParams()
    const {
      title,
      exercise,
      final,
      exercise: {Component: Exercise},
      final: {Component: Final},
    } = exerciseInfo[exerciseId]
    return (
      <div
        style={{
          padding: '20px 20px 40px 20px',
          minHeight: '100%',
          display: 'grid',
          gridGap: '20px',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '30px 1fr 30px',
        }}
      >
        <h1 style={{gridColumn: 'span 2', textAlign: 'center'}}>{title}</h1>
        <ComponentContainer
          label={
            <a href={exercise.isolatedPath} onClick={handleAnchorClick}>
              Exercise
            </a>
          }
        >
          <Exercise />
        </ComponentContainer>
        <ComponentContainer
          label={
            <a href={final.isolatedPath} onClick={handleAnchorClick}>
              Final
            </a>
          }
        >
          <Final />
        </ComponentContainer>
        <NavigationFooter exerciseId={exerciseId} />
        <ExtraCreditLinks exerciseId={exerciseId} />
      </div>
    )
  }

  function NavigationFooter({exerciseId}) {
    const current = exerciseInfo[exerciseId]
    const info = current.final
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gridColumn: 'span 2',
        }}
      >
        <div style={{flex: 1}}>
          {info.previous ? (
            <Link to={`/${info.previous}`}>
              {exerciseInfo[info.previous].title}{' '}
              <span role="img" aria-label="previous">
                👈
              </span>
            </Link>
          ) : null}
        </div>
        <div style={{flex: 1, textAlign: 'center'}}>
          <Link to="/">Home</Link>
        </div>
        <div style={{flex: 1, textAlign: 'right'}}>
          {info.next ? (
            <Link to={`/${info.next}`}>
              <span role="img" aria-label="next">
                👉
              </span>{' '}
              {exerciseInfo[info.next].title}
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  function Home() {
    return (
      <div
        style={{
          maxWidth: 800,
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingTop: 30,
        }}
      >
        <h1 style={{textAlign: 'center'}}>{projectTitle}</h1>
        <span>
          <span role="img" aria-label="muscle">
            💪
          </span>
          {' Exercise'}
        </span>
        {' – '}
        <span>
          <span role="img" aria-label="checkered flag">
            🏁
          </span>
          {' Final Version'}
        </span>
        <div>
          {Object.entries(exerciseInfo).map(
            ([filename, {title, final, exercise}]) => {
              return (
                <div key={filename} style={{margin: 10, fontSize: '1.2rem'}}>
                  {filename}
                  {'. '}
                  <Link to={`/${filename}`}>{title}</Link>{' '}
                  <a
                    style={{textDecoration: 'none'}}
                    href={exercise.isolatedPath}
                    onClick={handleAnchorClick}
                    title="exercise"
                  >
                    <span role="img" aria-label="muscle">
                      💪
                    </span>
                  </a>
                  {' – '}
                  <a
                    style={{textDecoration: 'none'}}
                    href={final.isolatedPath}
                    onClick={handleAnchorClick}
                    title="final"
                  >
                    <span role="img" aria-label="checkered flag">
                      🏁
                    </span>
                  </a>
                </div>
              )
            },
          )}
        </div>
      </div>
    )
  }

  function NotFound() {
    return (
      <div
        style={{
          height: '100%',
          display: 'grid',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          {`Sorry... nothing here. To open one of the exercises, go to `}
          <code>{`/exerciseId`}</code>
          {`, for example: `}
          <Link to="/01">
            <code>{`/01`}</code>
          </Link>
        </div>
      </div>
    )
  }

  function Routes() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/:exerciseId">
            <ExerciseContainer />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Router>
    )
  }

  // cache
  const lazyComps = {final: {}, exercise: {}, examples: {}}

  function useIsolatedComponent({pathname}) {
    const isIsolated = pathname.startsWith('/isolated')
    const isFinal = pathname.includes('/exercises-final/')
    const isExercise = pathname.includes('/exercises/')
    const isExample = pathname.includes('/examples/')
    const moduleName = isIsolated
      ? pathname.split(/\/isolated\/.*?\//).slice(-1)[0]
      : null
    const IsolatedComponent = React.useMemo(() => {
      if (!moduleName) {
        return null
      }
      if (isFinal) {
        return (lazyComps.final[moduleName] =
          lazyComps.final[moduleName] || React.lazy(getFinalImport(moduleName)))
      } else if (isExercise) {
        return (lazyComps.exercise[moduleName] =
          lazyComps.exercise[moduleName] ||
          React.lazy(getExerciseImport(moduleName)))
      } else if (getExampleImport && isExample) {
        return (lazyComps.examples[moduleName] =
          lazyComps.examples[moduleName] ||
          React.lazy(getExampleImport(moduleName)))
      }
      return null
    }, [isExample, isExercise, isFinal, moduleName])
    return moduleName ? IsolatedComponent : null
  }

  function useExerciseTitle({pathname}) {
    const isIsolated = pathname.startsWith('/isolated')
    const isFinal = pathname.includes('/exercises-final/')
    const isExercise = pathname.includes('/exercises/')
    const exerciseName = isIsolated
      ? pathname.split(/\/isolated\/.*?\//).slice(-1)[0]
      : pathname.split('/').slice(-1)[0]

    React.useEffect(() => {
      document.title = [
        projectTitle,
        exerciseName,
        isExercise ? 'Exercise' : null,
        isFinal ? 'Final' : null,
      ]
        .filter(Boolean)
        .join(' | ')
    }, [exerciseName, isExercise, isFinal])
  }

  function useLocationBodyClassName({pathname}) {
    const className = pathname.replace(/\//g, '_')
    React.useEffect(() => {
      document.body.classList.add(className)
      return () => document.body.classList.remove(className)
    }, [className])
  }

  // function WorkshopApp() {
  //   const [location, setLocation] = React.useState(history.location)
  //   React.useEffect(() => history.listen(l => setLocation(l)), [])
  //   useExerciseTitle(location)
  //   useLocationBodyClassName(location)

  //   const IsolatedComponent = useIsolatedComponent(location)

  //   return (
  //     <React.Suspense
  //       fallback={
  //         <div style={{height: '100vh'}} className="totally-centered">
  //           Loading...
  //         </div>
  //       }
  //     >
  //       {IsolatedComponent ? (
  //         <div className="isolated-top-container">
  //           <div className="isolated-div-wrapper">
  //             <IsolatedComponent />
  //           </div>
  //         </div>
  //       ) : (
  //         <Routes />
  //       )}
  //     </React.Suspense>
  //   )
  // }

  // The reason we don't put the Isolated components as regular routes
  // and do all this complex stuff instead is so the React DevTools component
  // tree is as small as possible to make it easier for people to figure
  // out what is relevant to the example.
  function getIsolatedModuleImport({
    isIsolated,
    isFinal,
    isExercise,
    isExample,
    exerciseName,
  }) {
    if (!isIsolated) {
      return null
    }
    if (!exerciseName) {
      return null
    }

    if (isFinal) {
      return getFinalImport(exerciseName)
    } else if (isExercise) {
      return getExerciseImport(exerciseName)
    } else if (getExampleImport && isExample) {
      return getExampleImport(exerciseName)
    }
    return null
  }

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
    const isFinal = pathname.includes('/exercises-final/')
    const isExercise = pathname.includes('/exercises/')
    const isExample = pathname.includes('/examples/')
    const exerciseName = isIsolated
      ? pathname.split(/\/isolated\/.*?\//).slice(-1)[0]
      : pathname.split('/').slice(-1)[0]

    document.title = [
      projectTitle,
      exerciseName,
      isExercise ? 'Exercise' : null,
      isFinal ? 'Final' : null,
    ]
      .filter(Boolean)
      .join(' | ')

    const isolatedModuleImport = getIsolatedModuleImport({
      isIsolated,
      isFinal,
      isExercise,
      isExample,
      exerciseName,
    })

    if (isolatedModuleImport) {
      renderIsolated(isolatedModuleImport)
    } else {
      renderReact()
    }
    previousLocation = location
  }

  const rootEl = document.getElementById('⚛')

  function renderIsolated(isolatedModuleImport) {
    ReactDOM.unmountComponentAtNode(rootEl)
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
    ReactDOM.render(
      <React.Suspense
        fallback={
          <div style={{height: '100vh'}} className="totally-centered">
            Loading...
          </div>
        }
      >
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/:exerciseId">
              <ExerciseContainer />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Router>
      </React.Suspense>,
      rootEl,
    )
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
