/** @jsx jsx */

import 'focus-visible' // polyfill for :focus-visible (https://github.com/WICG/focus-visible)
import {jsx, Global} from '@emotion/core'
import React from 'react'
import facepaint from 'facepaint'
import {ThemeProvider, useTheme} from 'emotion-theming'
import preval from 'preval.macro'
import {Router, Switch, Route, Link, useParams} from 'react-router-dom'
import {Tabs, TabList, Tab, TabPanels, TabPanel} from '@reach/tabs'
import {hijackEffects} from 'stop-runaway-react-effects'
import {
  RiToolsLine,
  RiFlagLine,
  RiExternalLinkLine,
  RiArrowRightSLine,
  RiArrowLeftSLine,
  RiMoonClearLine,
  RiSunLine,
} from 'react-icons/ri'

import Logo from './assets/logo'
import getTheme, {prismThemeLight, prismThemeDark} from './theme'

const originalUseEffect = React.useEffect

const styleTag = document.createElement('style')
styleTag.innerHTML = [
  preval`module.exports = require('../other/css-file-to-string')('@reach/tabs/styles.css')`,
].join('\n')
document.head.prepend(styleTag)

const totallyCenteredStyles = {
  minWidth: '100%',
  minHeight: '100%',
  display: 'grid',
  alignItems: 'center',
  justifyContent: 'center',
}

const visuallyHiddenStyles = {
  border: '0',
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  width: '1px',
}

function renderReactApp({
  history,
  projectTitle,
  filesInfo,
  lazyComponents,
  imports,
  render,
  options: {stopRunawayEffects = true} = {},
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

  const mq = facepaint([
    '@media(min-width: 576px)',
    '@media(min-width: 768px)',
    '@media(min-width: 992px)',
    '@media(min-width: 1200px)',
  ])

  function ComponentContainer({label, ...props}) {
    return (
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
    )
  }
  ComponentContainer.displayName = 'ComponentContainer'

  function ExtraCreditLinks({exerciseNumber, ...props}) {
    const {extraCredit} = exerciseInfo[exerciseNumber]
    if (!extraCredit.length) {
      return null
    }

    return (
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
        }}
        {...props}
      >
        <span role="img" aria-label="Hannah Hundred">
          💯
        </span>
        <span
          css={{
            fontSize: 14,
            marginRight: '0.25rem',
            opacity: 0.9,
            textTransform: 'uppercase',
          }}
        >
          Extra Credits:
        </span>
        {extraCredit.map(
          (
            {extraCreditTitle, extraCreditNumber, isolatedPath},
            index,
            array,
          ) => (
            <span key={extraCreditNumber}>
              <a href={isolatedPath}>{extraCreditTitle}</a>
              {array.length - 1 === index ? null : (
                <span css={{marginRight: 5}}>,</span>
              )}
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
          <div css={totallyCenteredStyles}>Loading...</div>
        ) : status === 'error' ? (
          <div css={totallyCenteredStyles}>
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

  function ExerciseContainer(props) {
    const theme = useTheme()
    const {exerciseNumber} = useParams()

    // allow the user to continue to the next exercise with the left/right keys
    React.useEffect(() => {
      const handleKeyup = e => {
        if (e.target !== document.body) return
        if (e.key === 'ArrowRight') {
          const {number} =
            exerciseInfo[Number(exerciseNumber) + 1] || exerciseInfo[1]
          history.push(`/${number}`)
        } else if (e.key === 'ArrowLeft') {
          const {number} =
            exerciseInfo[Number(exerciseNumber) - 1] ||
            exerciseInfo[exerciseInfo.length - 1]
          history.push(`/${number}`)
        }
      }
      document.body.addEventListener('keyup', handleKeyup)
      return () => document.body.removeEventListener('keyup', handleKeyup)
    }, [exerciseNumber])

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
      <>
        <Navigation
          exerciseNumber={exerciseNumber}
          mode={props.mode}
          setMode={props.setMode}
        />
        <div css={{minHeight: 'calc(100vh - 60px)'}}>
          <div
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['100%', '100%', '50% 50%'],
              gridTemplateRows: 'auto',
            })}
          >
            <div
              css={mq({
                gridRow: [2, 2, 'auto'],
                height: ['auto', 'auto', 'calc(100vh - 60px)'],
                overflowY: ['auto', 'auto', 'scroll'],
                padding: '1rem 2rem 3rem 2rem',
                borderTop: `1px solid ${theme.sky}`,
                '::-webkit-scrollbar': {
                  background: theme.skyLight,
                  borderLeft: `1px solid ${theme.sky}`,
                  borderRight: `1px solid ${theme.sky}`,
                  width: 10,
                },
                '::-webkit-scrollbar-thumb': {
                  background: theme.skyDark,
                },
                'p, li': {
                  fontSize: 18,
                  lineHeight: 1.5,
                },
                blockquote: {
                  borderLeft: `2px solid ${theme.primary}`,
                  margin: 0,
                  paddingLeft: '1.5rem',
                },
                pre: {
                  background: theme.sky,
                  fontSize: '80%',
                  margin: '0 -2rem',
                  padding: '2rem',
                },
                ul: {padding: 0, listStylePosition: 'inside'},
                'p > code': {
                  background: theme.sky,
                  color: theme.text,
                  fontSize: '85%',
                  padding: '3px 5px',
                },
              })}
            >
              <React.Suspense
                fallback={<div css={totallyCenteredStyles}>Loading...</div>}
              >
                {instructionElement}
              </React.Suspense>
            </div>
            <div css={{background: theme.background}}>
              <Tabs
                css={{
                  background: theme.backgroundLight,
                  borderTop: `1px solid ${theme.sky}`,
                  height: '100%',
                  position: 'relative',
                  zIndex: 10,
                  '[data-reach-tab]': {
                    padding: '0.5rem 1.25rem',
                    ':hover': {
                      color: theme.primary,
                    },
                  },
                  '[data-reach-tab][data-selected]': {
                    background: theme.backgroundLight,
                    border: 'none',
                    svg: {fill: theme.primary},
                    ':hover': {
                      color: 'inherit',
                    },
                  },
                }}
              >
                <TabList css={{height: 50, background: theme.skyLight}}>
                  <Tab css={{display: 'flex', alignItems: 'center'}}>
                    <RiToolsLine
                      size="20"
                      color={theme.textLightest}
                      css={{marginRight: 5}}
                    />
                    <span>Exercise</span>
                  </Tab>
                  <Tab css={{display: 'flex', alignItems: 'center'}}>
                    <RiFlagLine
                      size="18"
                      color={theme.textLightest}
                      css={{marginRight: 5}}
                    />
                    Final
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <div
                      css={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                      }}
                    >
                      <a
                        css={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          padding: '1rem',
                          textDecoration: 'none',
                        }}
                        href={exercise.isolatedPath}
                      >
                        <RiExternalLinkLine css={{marginRight: '0.25rem'}} />
                        {'Open exercise on isolated page'}
                      </a>
                    </div>
                    <div
                      css={[
                        totallyCenteredStyles,
                        mq({
                          color: '#19212a',
                          background: 'white',
                          padding: '2rem 0',
                          minHeight: 500,
                          height: ['auto', 'auto', 'calc(100vh - 210px)'],
                          overflowY: ['auto', 'auto', 'scroll'],
                        }),
                      ]}
                    >
                      <React.Suspense
                        fallback={
                          <div
                            // this centers the loading with the loading
                            // for the instructions
                            css={[
                              totallyCenteredStyles,
                              mq({marginBottom: ['auto', 'auto', 80]}),
                            ]}
                          >
                            Loading...
                          </div>
                        }
                      >
                        <div
                          className="exercise-container render-container"
                          css={mq({paddingBottom: [0, 0, '2rem']})}
                        >
                          {exerciseElement}
                        </div>
                      </React.Suspense>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div
                      css={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                      }}
                    >
                      <a
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          padding: '1rem',
                          textDecoration: 'none',
                        }}
                        href={final.isolatedPath}
                      >
                        <RiExternalLinkLine css={{marginRight: '0.25rem'}} />
                        {' Open final on isolated page'}
                      </a>
                    </div>

                    <div
                      css={[
                        totallyCenteredStyles,
                        mq({
                          color: '#19212a',
                          background: 'white',
                          padding: '2rem 0',
                          minHeight: 500,
                          height: ['auto', 'auto', 'calc(100vh - 210px)'],
                          overflowY: ['auto', 'auto', 'scroll'],
                        }),
                      ]}
                    >
                      <React.Suspense
                        fallback={
                          <div
                            // this centers the loading with the loading
                            // for the instructions
                            css={[
                              totallyCenteredStyles,
                              mq({marginBottom: ['auto', 'auto', 80]}),
                            ]}
                          >
                            Loading...
                          </div>
                        }
                      >
                        <div
                          className="final-container render-container"
                          css={mq({paddingBottom: [0, 0, '2rem']})}
                        >
                          {finalElement}
                        </div>
                      </React.Suspense>
                    </div>
                  </TabPanel>
                </TabPanels>
                <ExtraCreditLinks
                  exerciseNumber={exerciseNumber}
                  css={mq({
                    background: theme.background,
                    bottom: 0,
                    padding: '1rem',
                    position: ['static', 'static', 'fixed'],
                    width: '100%',
                  })}
                />
              </Tabs>
            </div>
          </div>
        </div>
      </>
    )
  }
  ExerciseContainer.displayName = 'ExerciseContainer'

  function Navigation({exerciseNumber, mode, setMode}) {
    const theme = useTheme()
    const info = exerciseInfo[exerciseNumber]

    return (
      <div
        css={mq({
          a: {textDecoration: 'none'},
          alignItems: 'center',
          background: theme.backgroundLight,
          boxShadow:
            '0 0.9px 1.5px -18px rgba(0, 0, 0, 0.024), 0 2.4px 4.1px -18px rgba(0, 0, 0, 0.035), 0 5.7px 9.9px -18px rgba(0, 0, 0, 0.046), 0 19px 33px -18px rgba(0, 0, 0, 0.07)',
          display: 'grid',
          gridTemplateColumns: exerciseNumber
            ? ['3fr .5fr', '1fr 2fr', '1fr 1fr']
            : '1fr 1fr',
          height: 60,
          padding: ['0 1rem', '0 1.75rem'],
          width: '100%',
          'span[role="img"]': {
            fontSize: [24, 24, 'inherit'],
          },
          '.exercise-title': {
            color: theme.text,
            display: ['none', 'inline-block', 'inline-block'],
            fontSize: 15,
            opacity: 0.9,
            ':hover': {
              opacity: 1,
            },
          },
        })}
      >
        <div css={{display: 'flex', alignItems: 'center'}}>
          <Link
            to="/"
            css={{display: 'flex', alignItems: 'center', color: 'inherit'}}
          >
            <Logo css={{marginRight: '.5rem'}} strokeWidth={0.8} />
            <div css={{display: 'flex', flexDirection: 'column'}}>
              <h1 css={{fontSize: 16, margin: 0}}>{projectTitle}</h1>
              <span css={{fontSize: 14, opacity: '.8'}}>Epic React</span>
            </div>
          </Link>
        </div>

        <div
          css={{
            alignItems: 'center',
            display: 'grid',
            gridTemplateColumns: exerciseNumber ? '3fr 2fr 3fr 3rem' : '1fr',
            paddingLeft: '1rem',
            width: '100%',
          }}
        >
          {exerciseNumber && (
            <>
              <div>
                {info.previous ? (
                  <Link
                    to={`/${info.previous.number}`}
                    css={{display: 'flex', alignItems: 'center'}}
                  >
                    <RiArrowLeftSLine size={20} />
                    <span className="exercise-title">
                      {info.previous.title}
                    </span>
                  </Link>
                ) : null}
              </div>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {exerciseInfo.map(e => (
                  <React.Fragment key={e.id}>
                    <input
                      id={`exercise-dot-${e.id}`}
                      type="radio"
                      name="exercise-dots"
                      checked={e.id === info.id}
                      onChange={() => history.push(`/${e.number}`)}
                      css={visuallyHiddenStyles}
                    />
                    <label htmlFor={`exercise-dot-${e.id}`} title={e.title}>
                      <span css={visuallyHiddenStyles}>{e.title}</span>
                      <span
                        css={{
                          cursor: 'pointer',
                          display: 'block',
                          background:
                            e.id === info.id ? theme.primary : theme.skyDark,
                          borderRadius: '50%',
                          height: 12,
                          width: 12,
                          margin: '0 6px',
                        }}
                      />
                    </label>
                  </React.Fragment>
                ))}
              </div>
              <div css={{textAlign: 'right'}}>
                {info.next ? (
                  <Link
                    to={`/${info.next.number}`}
                    css={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <span className="exercise-title">{info.next.title}</span>{' '}
                    <RiArrowRightSLine size={20} />
                  </Link>
                ) : null}
              </div>
            </>
          )}
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <button
              css={{
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: theme.text,
                textAlign: 'right',
              }}
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            >
              {mode === 'light' ? (
                <RiMoonClearLine size="1.25rem" color="currentColor" />
              ) : (
                <RiSunLine size="1.25rem" color="currentColor" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
  Navigation.displayName = 'Navigation'

  function Home(props) {
    const theme = useTheme()
    return (
      <>
        <Navigation mode={props.mode} setMode={props.setMode} />
        <div
          css={mq({
            width: '100%',
            maxWidth: 800,
            minHeight: '85vh',
            margin: '0 auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Logo
            size={120}
            color={theme.skyDark}
            strokeWidth={0.7}
            css={mq({opacity: 0.5, marginTop: ['3rem', 0]})}
          />
          <h1
            css={mq({
              textAlign: 'center',
              marginBottom: ['4rem', '4rem'],
              marginTop: '3rem',
            })}
          >
            {projectTitle}
          </h1>
          <div
            css={mq({
              width: '100%',
              display: 'grid',
              gridTemplateColumns: ['auto', 'auto'],
              gridGap: '1rem',
            })}
          >
            {exerciseInfo
              .filter(Boolean)
              .map(({id, number, title, final, exercise}) => {
                return (
                  <div
                    key={id}
                    css={mq({
                      alignItems: 'center',
                      background: theme.backgroundLight,
                      borderRadius: 5,
                      boxShadow:
                        '0 0px 1.7px -7px rgba(0, 0, 0, 0.02), 0 0px 4px -7px rgba(0, 0, 0, 0.028), 0 0px 7.5px -7px rgba(0, 0, 0, 0.035), 0 0px 13.4px -7px rgba(0, 0, 0, 0.042), 0 0px 25.1px -7px rgba(0, 0, 0, 0.05), 0 0px 60px -7px rgba(0, 0, 0, 0.07)',
                      display: 'grid',
                      fontSize: '18px',
                      gridTemplateColumns: ['auto', '60% 40%'],
                      position: 'relative',
                      ':hover': {
                        background: theme.skyLight,
                        small: {
                          opacity: 1,
                        },
                        '::before': {
                          background: theme.primary,
                          border: `2px solid ${theme.primary}`,
                          color: theme.background,
                        },
                      },
                      '::before': {
                        alignItems: 'center',
                        background: theme.backgroundLight,
                        border: `2px solid ${theme.skyDark}`,
                        borderRadius: 12,
                        color: theme.textLightest,
                        content: `"${number}"`,
                        display: ['none', 'flex'],
                        fontSize: 12,
                        fontWeight: 600,
                        height: 24,
                        justifyContent: 'center',
                        marginLeft: 23,
                        marginTop: 0,
                        paddingTop: 1,
                        paddingLeft: 1,
                        position: 'absolute',
                        textAlign: 'center',
                        width: 24,
                        zIndex: 1,
                      },
                      '::after': {
                        content: '""',
                        position: 'absolute',
                        display: ['none', 'block'],
                        width: 2,
                        height: 'calc(100% + 1rem)',
                        background: theme.skyDark,
                        marginLeft: 34,
                      },
                      ':first-of-type': {
                        '::after': {
                          content: '""',
                          position: 'absolute',
                          display: ['none', 'block'],
                          width: 2,
                          height: 'calc(50% + 1rem)',
                          background: theme.skyDark,
                          marginLeft: 34,
                          marginTop: '4rem',
                        },
                      },
                      ':last-of-type': {
                        '::after': {
                          content: '""',
                          position: 'absolute',
                          display: ['none', 'block'],
                          width: 2,
                          height: 'calc(50% + 1rem)',
                          background: theme.skyDark,
                          marginLeft: 34,
                          marginBottom: '4rem',
                        },
                      },
                    })}
                  >
                    <Link
                      to={`/${number}`}
                      css={mq({
                        padding: ['2rem 2rem 0 2rem', '2rem 2.5rem 2rem 2rem'],
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        ':hover': {
                          h3: {
                            textDecoration: 'underline',
                            textDecorationColor: 'rgba(0,0,0,0.3)',
                          },
                        },
                      })}
                    >
                      <small
                        css={mq({
                          display: ['block', 'none'],

                          opacity: 0.7,
                          fontSize: 14,
                        })}
                      >
                        {number}
                      </small>
                      <h3
                        css={mq({
                          fontSize: [24, 20],
                          fontWeight: [600, 500],
                          margin: 0,
                          marginLeft: ['1rem', '2rem'],
                        })}
                      >
                        {title}
                      </h3>
                    </Link>
                    <div
                      css={mq({
                        width: '100%',
                        display: 'flex',
                        flexDirection: ['column', 'row'],
                        height: ['auto', 48],
                        padding: ['1.5rem 1rem', '8px 15px'],
                        alignItems: 'center',
                      })}
                    >
                      <a
                        href={exercise.isolatedPath}
                        title="exercise"
                        css={mq({
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: ['flex-start', 'center'],
                          color: 'inherit',
                          padding: ['.7rem 1rem', 0],
                          fontSize: 16,
                          height: [48, 56],
                          textDecoration: 'none',
                          borderRadius: 5,
                          ':hover': {
                            background: theme.backgroundLight,
                            svg: {fill: theme.primary},
                          },
                        })}
                      >
                        <RiToolsLine
                          size="20"
                          color={theme.textLightest}
                          css={{marginRight: 5}}
                        />
                        <span>Exercise</span>
                      </a>
                      <a
                        href={final.isolatedPath}
                        title="final version"
                        css={mq({
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: ['flex-start', 'center'],
                          color: 'inherit',
                          padding: ['.7rem 1rem', 0],
                          height: [48, 56],
                          fontSize: 16,
                          textDecoration: 'none',
                          borderRadius: 5,
                          ':hover': {
                            background: theme.backgroundLight,
                            svg: {fill: theme.primary},
                          },
                        })}
                      >
                        <RiFlagLine
                          size="18"
                          color={theme.textLightest}
                          css={{marginRight: 5}}
                        />
                        <span>Final Version</span>
                      </a>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </>
    )
  }
  Home.displayName = 'Home'

  function NotFound() {
    const theme = useTheme()
    return (
      <div
        css={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <Logo
            size={120}
            color={theme.skyDark}
            strokeWidth={0.7}
            css={{opacity: 0.7}}
          />
          <h1>{`Sorry... nothing here.`}</h1>
          {`To open one of the exercises, go to `}
          <code>{`/exerciseNumber`}</code>
          {`, for example: `}
          <Link to="/1">
            <code>{`/1`}</code>
          </Link>
          <div css={{marginTop: '2rem', a: {textDecoration: 'none'}}}>
            <Link
              to="/"
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RiArrowLeftSLine />
              Back home
            </Link>
          </div>
        </div>
      </div>
    )
  }
  NotFound.displayName = 'NotFound'

  function useDarkMode() {
    const preferDarkQuery = '(prefers-color-scheme: dark)'
    const [mode, setMode] = React.useState(
      () =>
        window.localStorage.getItem('colorMode') ||
        (window.matchMedia(preferDarkQuery).matches ? 'dark' : 'light'),
    )

    React.useEffect(() => {
      const mediaQuery = window.matchMedia(preferDarkQuery)
      const handleChange = () => {
        setMode(mediaQuery.matches ? 'dark' : 'light')
      }
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }, [])

    React.useEffect(() => {
      window.localStorage.setItem('colorMode', mode)
    }, [mode])

    // we're doing it this way instead of as an effect so we only
    // set the localStorage value if they explicitly change the default
    return [mode, setMode]
  }

  function DelayedTransition() {
    // we have it this way so dark mode is rendered immediately rather than
    // transitioning to it on initial page load.
    const [renderStyles, setRender] = React.useState(false)
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        setRender(true)
      }, 450)
      return () => clearTimeout(timeout)
    }, [])

    return renderStyles ? (
      <Global
        styles={{
          '*, *::before, *::after': {
            // for the theme change
            transition: `background 0.4s, background-color 0.4s, border-color 0.4s`,
          },
        }}
      />
    ) : null
  }

  function App() {
    const [mode, setMode] = useDarkMode()
    const theme = getTheme(mode)

    React.useLayoutEffect(() => {
      document.getElementById('root').classList.add('react-workshop-app')
    })

    return (
      <ThemeProvider theme={theme}>
        <Router history={history}>
          <Switch>
            <Route exact path="/">
              <Home mode={mode} setMode={setMode} />
            </Route>
            <Route exact path="/:exerciseNumber">
              <ExerciseContainer mode={mode} setMode={setMode} />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Router>
        <Global
          styles={{
            'html, body, #root': {
              background: theme.background,
              color: theme.text,
            },
            '::selection': {
              background: theme.primary,
              color: 'white',
            },
            '[data-reach-tab]': {
              cursor: 'pointer',
            },
            a: {
              color: theme.primary,
            },
            /*
              This will hide the focus indicator if the element receives focus via the mouse,
              but it will still show up on keyboard focus.
            */
            '.js-focus-visible :focus:not(.focus-visible)': {
              outline: 'none',
            },
            hr: {
              opacity: 0.5,
              border: 'none',
              height: 1,
              background: theme.textLightest,
              maxWidth: '100%',
              marginTop: 30,
              marginBottom: 30,
            },
          }}
        />
        <Global
          styles={`
              ${mode === 'light' ? prismThemeLight : prismThemeDark}
            `}
        />
        <DelayedTransition />
      </ThemeProvider>
    )
  }

  return render(<App />, document.getElementById('root'))
}

export {renderReactApp}

/*
eslint
  max-statements: "off"
*/
