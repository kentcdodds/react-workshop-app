import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from 'react-router-dom'
import {hijackEffects} from 'stop-runaway-react-effects'

const originalUseEffect = React.useEffect

function renderReactApp({
  history,
  projectTitle,
  filesInfo,
  lazyComponents,
  imports,
  renderOptions: {stopRunawayEffects = true} = {},
}) {
  if (
    process.env.NODE_ENV !== 'production' &&
    stopRunawayEffects &&
    React.useEffect === originalUseEffect
  ) {
    hijackEffects()
  }

  const exerciseInfo = []
  const exerciseTypes = ['final', 'exercise', 'extraCredit', 'instruction']
  for (const fileInfo of filesInfo) {
    if (exerciseTypes.includes(fileInfo.type)) {
      exerciseInfo[fileInfo.number] = exerciseInfo[fileInfo.number] ?? {
        extraCredit: [],
      }
      const info = exerciseInfo[fileInfo.number]
      if (fileInfo.type === 'extraCredit') {
        info.extraCredit.push(fileInfo)
      } else if (fileInfo.type === 'instruction') {
        info.instruction = fileInfo
        const {title, number, id} = fileInfo
        Object.assign(info, {title, number, id})
      } else {
        Object.assign(info, {
          [fileInfo.type]: fileInfo,
        })
      }
    }
  }

  for (const info of exerciseInfo) {
    if (info) {
      info.next = exerciseInfo[info.number + 1]
      info.previous = exerciseInfo[info.number - 1]
    }
  }

  function handleAnchorClick(event) {
    if (event.metaKey || event.shiftKey) {
      return
    }
    event.preventDefault()
    history.push(event.target.closest('a').getAttribute('href'))
  }

  function ComponentContainer({label, ...props}) {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
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
  ComponentContainer.displayName = 'ComponentContainer'

  function ExtraCreditLinks({exerciseNumber}) {
    const {extraCredit} = exerciseInfo[exerciseNumber]
    if (!extraCredit.length) {
      return null
    }

    return (
      <div style={{gridColumn: 'span 2'}}>
        {`💯 Extra Credits: `}
        {extraCredit.map(
          (
            {extraCreditTitle, extraCreditNumber, isolatedPath},
            index,
            array,
          ) => (
            <span key={extraCreditNumber}>
              <a href={isolatedPath} onClick={handleAnchorClick}>
                {extraCreditTitle}
              </a>
              {array.length - 1 === index ? null : ' | '}
            </span>
          ),
        )}
      </div>
    )
  }
  ExtraCreditLinks.displayName = 'ExtraCreditLinks'

  function IsolatedHtml({importHtml}) {
    const [{status, html, error}, setState] = React.useState({
      status: 'idle',
      html: null,
    })

    React.useEffect(() => {
      importHtml().then(
        ({default: htmlString}) => {
          setState({html: htmlString, error: null, status: 'success'})
        },
        e => {
          setState({html: null, error: e, status: 'success'})
        },
      )
    }, [importHtml])

    return (
      <div style={{minHeight: 300, width: '100%'}}>
        {status === 'idle' || status === 'loading' ? (
          <div className="totally-centered">Loading...</div>
        ) : status === 'error' ? (
          <div className="totally-centered">
            <div>Error loading</div>
            <pre>{error.message}</pre>
          </div>
        ) : (
          <HtmlInIframe html={html} />
        )}
      </div>
    )
  }
  IsolatedHtml.displayName = 'IsolatedHtml'

  function HtmlInIframe({html}) {
    const iframeRef = React.useRef(null)
    React.useEffect(() => {
      if (!iframeRef.current.contentDocument) {
        // if they're navigating around quickly this can happen
        return
      }
      iframeRef.current.contentDocument.open()
      iframeRef.current.contentDocument.write(html)
      iframeRef.current.contentDocument.close()
    }, [html])
    return (
      // eslint-disable-next-line jsx-a11y/iframe-has-title
      <iframe style={{border: 'none'}} ref={iframeRef} />
    )
  }
  HtmlInIframe.displayName = 'HtmlInIframe'

  function ExerciseContainer() {
    const {exerciseNumber} = useParams()
    const {instruction, exercise, final} = exerciseInfo[exerciseNumber]
    let exerciseElement, finalElement, instructionElement

    if (lazyComponents[exercise.id]) {
      exerciseElement = React.createElement(lazyComponents[exercise.id])
    }
    if (lazyComponents[final.id]) {
      finalElement = React.createElement(lazyComponents[final.id])
    }
    if (lazyComponents[instruction.id]) {
      instructionElement = React.createElement(lazyComponents[instruction.id])
    }
    if (exercise.ext === '.html') {
      exerciseElement = <IsolatedHtml importHtml={imports[exercise.id]} />
    }
    if (final.ext === '.html') {
      finalElement = <IsolatedHtml importHtml={imports[final.id]} />
    }

    return (
      <div
        style={{
          padding: '20px 20px 40px 20px',
          minHeight: '100vh',
          // display: 'grid',
          // gridGap: '20px',
          // gridTemplateColumns: '1fr 1fr',
        }}
      >
        <div style={{gridColumn: 'span 2'}}>{instructionElement}</div>
        <hr />
        <div
          style={{
            display: 'grid',
            gridGap: '20px',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <ComponentContainer
            label={
              <a href={exercise.isolatedPath} onClick={handleAnchorClick}>
                Exercise
              </a>
            }
          >
            {exerciseElement}
          </ComponentContainer>
          <ComponentContainer
            label={
              <a href={final.isolatedPath} onClick={handleAnchorClick}>
                Final
              </a>
            }
          >
            {finalElement}
          </ComponentContainer>
        </div>
        <hr />
        <NavigationFooter exerciseNumber={exerciseNumber} />
        <ExtraCreditLinks exerciseNumber={exerciseNumber} />
      </div>
    )
  }
  ExerciseContainer.displayName = 'ExerciseContainer'

  function NavigationFooter({exerciseNumber}) {
    const info = exerciseInfo[exerciseNumber]
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
            <Link to={`/${info.previous.number}`}>
              {info.previous.title}{' '}
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
            <Link to={`/${info.next.number}`}>
              <span role="img" aria-label="next">
                👉
              </span>{' '}
              {info.next.title}
            </Link>
          ) : null}
        </div>
      </div>
    )
  }
  NavigationFooter.displayName = 'NavigationFooter'

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
          {exerciseInfo
            .filter(Boolean)
            .map(({id, number, title, final, exercise}) => {
              return (
                <div key={id} style={{margin: 10, fontSize: '1.2rem'}}>
                  {number}
                  {'. '}
                  <Link to={`/${number}`}>{title}</Link>{' '}
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
            })}
        </div>
      </div>
    )
  }
  Home.displayName = 'Home'

  function NotFound() {
    return (
      <div className="totally-centered">
        <div>
          {`Sorry... nothing here. To open one of the exercises, go to `}
          <code>{`/exerciseNumber`}</code>
          {`, for example: `}
          <Link to="/01">
            <code>{`/01`}</code>
          </Link>
        </div>
      </div>
    )
  }
  NotFound.displayName = 'NotFound'

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
          <Route exact path="/:exerciseNumber">
            <ExerciseContainer />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Router>
    </React.Suspense>,
    document.getElementById('⚛'),
  )

  return function unmount() {
    ReactDOM.unmountComponentAtNode(document.getElementById('⚛'))
  }
}

export {renderReactApp}

/*
eslint
  react/prop-types: "off",
  babel/no-unused-expressions: "off",
*/
