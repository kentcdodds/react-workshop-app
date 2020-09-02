import {setupWorker} from 'msw'
import {setupServer} from 'msw/node'
import {match} from 'node-match-path'

const getKey = name => `__react_workshop_app_${name}__`

let sleep
if (process.env.NODE_ENV === 'test') {
  sleep = () => Promise.resolve()
} else {
  sleep = (
    t = Math.random() * ls(getKey('variable_request_time'), 400) +
      ls(getKey('min_request_time'), 400),
  ) => new Promise(resolve => setTimeout(resolve, t))
}

function ls(key, defaultVal) {
  const lsVal = window.localStorage.getItem(key)
  let val
  if (lsVal) {
    val = Number(lsVal)
  }
  return Number.isFinite(val) ? val : defaultVal
}

const server = {}
function setup({handlers}) {
  const enhancedHandlers = handlers.map(handler => {
    return {
      ...handler,
      async resolver(req, res, ctx) {
        try {
          if (shouldFail(req)) {
            throw new Error('Request failure (for testing purposes).')
          }
          const result = await handler.resolver(req, res, ctx)
          return result
        } catch (error) {
          const status = error.status || 500
          return res(
            ctx.status(status),
            ctx.json({status, message: error.message || 'Unknown Error'}),
          )
        } finally {
          let delay
          if (req.headers.has('delay')) {
            delay = Number(req.headers.has('delay'))
          }
          await sleep(delay)
        }
      },
    }
  })
  if (process.env.NODE_ENV === 'test') {
    Object.assign(server, setupServer(...enhancedHandlers))
    return server
  } else {
    Object.assign(server, setupWorker(...enhancedHandlers))
    return server
  }
}

function shouldFail(req) {
  if (JSON.stringify(req.body)?.includes('FAIL')) return true
  if (req.url.searchParams.toString()?.includes('FAIL')) return true
  if (process.env.NODE_ENV === 'test') return false
  const failureRate = Number(
    window.localStorage.getItem(getKey('failure_rate')) || 0,
  )
  if (Math.random() < failureRate) return true
  if (requestMatchesFailConfig(req)) return true

  return false
}

function requestMatchesFailConfig(req) {
  function configMatches({requestMethod, urlMatch}) {
    return (
      (requestMethod === 'ALL' || req.method === requestMethod) &&
      match(urlMatch, req.url.pathname).matches
    )
  }
  try {
    const failConfig = JSON.parse(
      window.localStorage.getItem(getKey('request_fail_config')) || '[]',
    )
    if (failConfig.some(configMatches)) return true
  } catch (error) {
    window.localStorage.removeItem(getKey('request_fail_config'))
  }
  return false
}

export * from 'msw'
export {setup, server}
