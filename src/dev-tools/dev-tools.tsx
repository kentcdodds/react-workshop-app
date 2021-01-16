/** @jsx jsx */
import {jsx, Global} from '@emotion/core'

import '@reach/tabs/styles.css'
import '@reach/tooltip/styles.css'

import * as React from 'react'
import ReactDOM from 'react-dom'
import {FaTools} from 'react-icons/fa'
import {Tooltip} from '@reach/tooltip'
import {Tabs, TabList, TabPanels, TabPanel, Tab} from '@reach/tabs'
import * as colors from '../styles/colors'

const isLsKey = (name: string) => name.startsWith(`__react_workshop_app`)
const getKey = (name: string) => `__react_workshop_app_${name}__`

function install() {
  // @ts-expect-error I do not care...
  const requireDevToolsLocal = require.context(
    './',
    false,
    /dev-tools\.local\.(js|tsx|ts)/,
  )
  const local = requireDevToolsLocal.keys()[0]
  if (local) {
    requireDevToolsLocal(local)
  }

  function DevTools() {
    const rootRef = React.useRef<HTMLDivElement>(null)
    const [hovering, setHovering] = React.useState(false)
    const [persist, setPersist] = useLocalStorageState(
      getKey('devtools_persist'),
      false,
    )
    const [tabIndex, setTabIndex] = useLocalStorageState(
      getKey('devtools_tab_index'),
      0,
    )

    const show = persist || hovering
    const toggleShow = () => setPersist(v => !v)
    React.useEffect(() => {
      function updateHoverState(event: MouseEvent) {
        setHovering(rootRef.current?.contains(event.target as Node) ?? false)
      }
      document.addEventListener('mousemove', updateHoverState)
      return () => {
        document.removeEventListener('mousemove', updateHoverState)
      }
    }, [])

    // eslint-disable-next-line consistent-return
    React.useEffect(() => {
      if (hovering) {
        const iframes = Array.from(document.querySelectorAll('iframe'))
        for (const iframe of iframes) {
          iframe.style.pointerEvents = 'none'
        }
        return () => {
          for (const iframe of iframes) {
            iframe.style.pointerEvents = ''
          }
        }
      }
    }, [hovering])

    return (
      <div
        css={{
          position: 'fixed',
          zIndex: 20,
          bottom: -15,
          left: 0,
          right: 0,
          width: show ? '100%' : 0,
          transition: 'all 0.3s',
          label: {
            margin: 0,
            color: 'rgb(216, 221, 227)',
          },
          'input, select': {
            background: 'rgb(20, 36, 55)',
            border: '2px solid rgb(28, 46, 68)',
            borderRadius: 5,
            color: 'white',
            fontWeight: 600,
            padding: '5px',
            '::placeholder': {
              color: 'rgba(255,255,255,0.3)',
            },
            ':focus': {
              outlineColor: colors.indigo,
              borderColor: colors.indigo,
              outline: '1px',
            },
          },
          button: {
            cursor: 'pointer',
          },
          'button:not([data-reach-tab])': {
            borderRadius: 5,
            background: colors.indigo,
            ':hover': {
              background: colors.indigoDarken10,
            },
            border: 0,
            color: colors.gray,
          },
          '[data-reach-tab]': {
            border: 0,
            ':focus': {
              outline: 'none',
            },
          },
          '[data-reach-tab][data-selected]': {
            background: 'rgb(11, 21, 33)',
            borderBottom: '3px solid white',
            marginBottom: -3,
          },
        }}
      >
        <div
          ref={rootRef}
          css={[
            {
              background: 'rgb(11, 21, 33)',
              opacity: '0.6',
              color: 'white',
              boxSizing: 'content-box',
              height: '60px',
              width: '68px',
              transition: 'all 0.3s',
              overflow: 'auto',
            },
            show
              ? {
                  height: '50vh',
                  width: '100%',
                  opacity: '1',
                }
              : null,
          ]}
        >
          <Tooltip label="Toggle Persist DevTools">
            <button
              css={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.2rem',
                border: 'none',
                padding: '10px 20px',
                background: 'none',
                marginTop: show ? -40 : 0,
                marginLeft: show ? 20 : 0,
                position: 'absolute',
                backgroundColor: 'rgb(11,21,33) !important',
                overflow: 'hidden',
                svg: {
                  width: 20,
                  marginRight: 8,
                  color: persist ? 'white' : 'rgba(255,255,255,0.7)',
                },
                '::before': {
                  content: '""',
                  position: 'absolute',
                  height: 4,
                  width: '100%',
                  left: 0,
                  top: 0,
                  background: persist ? colors.yellow : 'transparent',
                },
              }}
              onClick={toggleShow}
            >
              <FaTools />
              {show ? 'Workshop DevTools' : null}
            </button>
          </Tooltip>
          {show ? (
            <Tabs
              css={{padding: 20}}
              index={tabIndex}
              onChange={i => setTabIndex(i)}
            >
              <TabList css={{marginBottom: 20}}>
                <Tab>Controls</Tab>
                <Tab>Request Failures</Tab>
              </TabList>
              <div
                css={{
                  border: '1px solid rgb(28,46,68)',
                  margin: '0px -20px 20px -20px',
                }}
              />
              <TabPanels css={{height: '100%'}}>
                <TabPanel>
                  <ControlsPanel />
                </TabPanel>
                <TabPanel>
                  <RequestFailUI />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : null}
        </div>
        {show ? (
          <Global
            styles={{
              '#root': {
                marginBottom: '50vh',
              },
            }}
          />
        ) : null}
      </div>
    )
  }
  DevTools.displayName = 'DevTools'
  // add dev tools UI to the page
  let devToolsRoot = document.getElementById('dev-tools')
  if (devToolsRoot) {
    ReactDOM.unmountComponentAtNode(devToolsRoot)
    // right
  }
  if (!devToolsRoot) {
    devToolsRoot = document.createElement('div')
    devToolsRoot.id = 'dev-tools'
    document.body.appendChild(devToolsRoot)
  }
  ReactDOM.render(<DevTools />, devToolsRoot)
}

function ControlsPanel() {
  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(auto-fill, minmax(40px, 40px) )',
        gridGap: '0.5rem',
        marginRight: '1.5rem',
      }}
    >
      <EnableDevTools />
      <FailureRate />
      <RequestMinTime />
      <RequestVarTime />
      <ClearLocalStorage />
    </div>
  )
}
ControlsPanel.displayName = 'ControlsPanel'

function ClearLocalStorage() {
  function clear() {
    const keysToRemove: Array<string> = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (typeof key === 'string' && isLsKey(key)) keysToRemove.push(key)
    }
    for (const lsKey of keysToRemove) {
      window.localStorage.removeItem(lsKey)
    }
    // refresh
    window.location.assign(window.location.toString())
  }
  return <button onClick={clear}>Purge Database</button>
}
ClearLocalStorage.displayName = 'ClearLocalStorage'

function FailureRate() {
  const [failureRate, setFailureRate] = useLocalStorageState(
    getKey('failure_rate'),
    0,
  )

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setFailureRate(Number(event.currentTarget.value) / 100)

  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <label htmlFor="failureRate">Request Failure Percentage: </label>
      <input
        css={{marginLeft: 6}}
        value={failureRate * 100}
        type="number"
        min="0"
        max="100"
        step="10"
        onChange={handleChange}
        id="failureRate"
      />
    </div>
  )
}
FailureRate.displayName = 'FailureRate'

function EnableDevTools() {
  const [enableDevTools, setEnableDevTools] = useLocalStorageState(
    getKey('dev-tools'),
    process.env.NODE_ENV === 'development',
  )

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setEnableDevTools(event.currentTarget.checked)

  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <input
        css={{marginRight: 6}}
        checked={enableDevTools}
        type="checkbox"
        onChange={handleChange}
        id="enableDevTools"
      />
      <label htmlFor="enableDevTools">Enable DevTools by default</label>
    </div>
  )
}
EnableDevTools.displayName = 'EnableDevTools'

function RequestMinTime() {
  const [minTime, setMinTime] = useLocalStorageState(
    getKey('min_request_time'),
    400,
  )

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setMinTime(Number(event.currentTarget.value))

  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <label htmlFor="minTime">Request min time (ms): </label>
      <input
        css={{marginLeft: 6}}
        value={minTime}
        type="number"
        step="100"
        min="0"
        max={1000 * 60}
        onChange={handleChange}
        id="minTime"
      />
    </div>
  )
}
RequestMinTime.displayName = 'RequestMinTime'

function RequestVarTime() {
  const [varTime, setVarTime] = useLocalStorageState(
    getKey('variable_request_time'),
    400,
  )

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setVarTime(Number(event.currentTarget.value))

  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <label htmlFor="varTime">Request variable time (ms): </label>
      <input
        css={{marginLeft: 6}}
        value={varTime}
        type="number"
        step="100"
        min="0"
        max={1000 * 60}
        onChange={handleChange}
        id="varTime"
      />
    </div>
  )
}
RequestVarTime.displayName = 'RequestVarTime'

interface RequestFailFormElements extends HTMLFormControlsCollection {
  requestMethod: HTMLInputElement
  urlMatch: HTMLInputElement
}
interface RequestFailFormElement extends HTMLFormElement {
  readonly elements: RequestFailFormElements
}

function RequestFailUI() {
  type FailConfig = {
    requestMethod: string
    urlMatch: string
  }
  const [failConfig, setFailConfig] = useLocalStorageState<Array<FailConfig>>(
    getKey('request_fail_config'),
    [],
  )

  function handleRemoveClick(index: number) {
    setFailConfig(c => [...c.slice(0, index), ...c.slice(index + 1)])
  }

  function handleSubmit(event: React.SyntheticEvent<RequestFailFormElement>) {
    event.preventDefault()
    const {requestMethod, urlMatch} = event.currentTarget.elements
    setFailConfig(c => [
      ...c,
      {requestMethod: requestMethod.value, urlMatch: urlMatch.value},
    ])
    requestMethod.value = ''
    urlMatch.value = ''
  }

  return (
    <div
      css={{
        display: 'flex',
        width: '100%',
      }}
    >
      <form
        onSubmit={handleSubmit}
        css={{
          display: 'grid',
          gridTemplateRows: 'repeat(auto-fill, minmax(50px, 60px) )',
          maxWidth: 300,
          width: '100%',
          marginRight: '1rem',
          gridGap: 10,
        }}
      >
        <div
          css={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <label htmlFor="requestMethod">Method:</label>
          <select id="requestMethod" required>
            <option value="">Select</option>
            <option value="ALL">ALL</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div css={{width: '100%'}}>
          <label css={{display: 'block'}} htmlFor="urlMatch">
            URL Match:
          </label>
          <input
            autoComplete="off"
            css={{width: '100%', marginTop: 4}}
            id="urlMatch"
            required
            placeholder="/api/list-items/:listItemId"
          />
        </div>
        <div>
          <button css={{padding: '6px 16px'}} type="submit">
            + Add
          </button>
        </div>
      </form>
      <ul
        css={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          width: '100%',
          paddingBottom: '2rem',
        }}
      >
        {failConfig.map(({requestMethod, urlMatch}, index) => (
          <li
            key={index}
            css={{
              padding: '6px 10px',
              borderRadius: 5,
              margin: '5px 0',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgb(20,36,55)',
            }}
          >
            <div css={{display: 'flex', flexWrap: 'wrap'}}>
              <strong css={{minWidth: 70}}>{requestMethod}:</strong>
              <span css={{marginLeft: 10, whiteSpace: 'pre'}}>{urlMatch}</span>
            </div>
            <button
              css={{
                opacity: 0.6,
                ':hover': {opacity: 1},
                fontSize: 13,
                background: 'rgb(11, 20, 33) !important',
              }}
              onClick={() => handleRemoveClick(index)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
RequestFailUI.displayName = 'RequestFailUI'

const getLSDebugValue = <TState,>({
  key,
  state,
  serialize,
}: {
  key: string
  state: TState
  serialize: (data: TState) => string
}) => `${key}: ${serialize(state)}`

type UseLocalStorageOptions<TState = unknown> = {
  serialize?: (data: TState) => string
  deserialize?: (str: string) => TState
}
function useLocalStorageState<TState>(
  key: string,
  defaultValue: TState | (() => TState),
  {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  }: UseLocalStorageOptions<TState> = {},
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key)
    if (valueInLocalStorage) {
      return deserialize(valueInLocalStorage)
    }
    // can't do typeof because:
    // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-759728342
    return defaultValue instanceof Function ? defaultValue() : defaultValue
  })

  React.useDebugValue({key, state, serialize}, getLSDebugValue)

  const prevKeyRef = React.useRef(key)

  React.useEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey)
    }
    prevKeyRef.current = key
    window.localStorage.setItem(key, serialize(state))
  }, [key, state, serialize])

  return [state, setState] as const
}

export {install}

/*
eslint
  no-unused-expressions: "off",
  @typescript-eslint/no-unsafe-assignment: "off",
  @typescript-eslint/no-unsafe-call: "off",
  @typescript-eslint/no-unsafe-member-access: "off",
*/
