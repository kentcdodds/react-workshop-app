import type {RequestHandler, MockedRequest, SetupWorkerApi} from 'msw'
import type {SetupServerApi} from 'msw/node'
import {setupWorker, rest} from 'msw'
import {setupServer} from 'msw/node'
import {match} from 'node-match-path'

const getKey = (name: string) => `__react_workshop_app_${name}__`

function getDefaultDelay() {
  const variableTime = ls(getKey('variable_request_time'), 400)
  const minTime = ls(getKey('min_request_time'), 400)
  return Math.random() * variableTime + minTime
}

function sleep(t = getDefaultDelay()): Promise<void> {
  return new Promise(resolve => {
    if (process.env.NODE_ENV === 'test') {
      resolve()
    } else {
      setTimeout(resolve, t)
    }
  })
}

function ls(key: string, defaultVal: number): number {
  const lsVal = window.localStorage.getItem(key)
  let val
  if (lsVal) {
    val = Number(lsVal)
  }
  return typeof val !== 'undefined' && Number.isFinite(val) ? val : defaultVal
}

const server = {} as SetupServerApi | SetupWorkerApi

function setup({
  handlers,
}: {
  handlers: Array<RequestHandler>
}): SetupServerApi | SetupWorkerApi {
  const enhancedHandlers = handlers.map(handler => {
    const enhancedResolver: Parameters<typeof rest.get>[1] = async (
      req,
      res,
      ctx,
    ) => {
      try {
        if (shouldFail(req)) {
          throw new Error('Request failure (for testing purposes).')
        }
        // @ts-expect-error the request body type is unknown
        // and I don't care enough to fix that.
        const result = await handler.resolver(req, res, ctx)
        return result
      } catch (error: unknown) {
        // @ts-expect-error handling the error case... ugh...
        const status: number = error.status || 500
        return await res(
          ctx.status(status),
          // @ts-expect-error res is expecting transformers<unknown>
          // and ctx.json is giving a specific one...
          ctx.json({status, message: error.message || 'Unknown Error'}),
        )
      } finally {
        let delay
        if (req.headers.has('delay')) {
          delay = Number(req.headers.get('delay'))
        }
        await sleep(delay)
      }
    }
    return {
      ...handler,
      resolver: enhancedResolver,
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

function shouldFail(req: MockedRequest<unknown>) {
  if (JSON.stringify(req.body ?? {}).includes('FAIL')) return true
  if (req.url.searchParams.toString().includes('FAIL')) return true
  const failureRate = Number(
    window.localStorage.getItem(getKey('failure_rate')) ?? 0,
  )
  if (Math.random() < failureRate) return true
  if (requestMatchesFailConfig(req)) return true

  return false
}

function requestMatchesFailConfig(req: MockedRequest<unknown>) {
  type Config = {requestMethod: string; urlMatch: string}
  function configMatches({requestMethod, urlMatch}: Config) {
    return (
      (requestMethod === 'ALL' || req.method === requestMethod) &&
      match(urlMatch, req.url.pathname).matches
    )
  }
  try {
    const failConfig: Array<Config> = JSON.parse(
      window.localStorage.getItem(getKey('request_fail_config')) ?? '[]',
    )
    return failConfig.some(configMatches)
  } catch (error: unknown) {
    window.localStorage.removeItem(getKey('request_fail_config'))
  }
  return false
}

export * from 'msw'
export {setup, server}

/*
eslint
  @typescript-eslint/no-unsafe-assignment: "off",
*/
