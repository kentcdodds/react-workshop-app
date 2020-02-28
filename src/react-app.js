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

function renderReactApp({
  projectTitle,
  filesInfo,
  lazyComponents,
  renderOptions: {stopRunawayEffects = true} = {},
}) {
  if (process.env.NODE_ENV !== 'production' && stopRunawayEffects) {
    hijackEffects()
  }

  const exerciseInfo = []
  for (const fileInfo of filesInfo) {
    if (fileInfo.parentDir === 'final' || fileInfo.parentDir === 'exercise') {
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
    info.next = exerciseInfo[info.number + 1]
    info.previous = exerciseInfo[info.number - 1]
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

  function ExerciseContainer() {
    const {exerciseNumber} = useParams()
    const {title, exercise, final} = exerciseInfo[exerciseNumber]
    const Exercise = lazyComponents[exercise.id]
    const Final = lazyComponents[final.id]
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
        <NavigationFooter exerciseNumber={exerciseNumber} />
        <ExtraCreditLinks exerciseNumber={exerciseNumber} />
      </div>
    )
  }

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
          {exerciseInfo.map(({id, number, title, final, exercise}) => {
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
          <code>{`/exerciseNumber`}</code>
          {`, for example: `}
          <Link to="/01">
            <code>{`/01`}</code>
          </Link>
        </div>
      </div>
    )
  }

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
