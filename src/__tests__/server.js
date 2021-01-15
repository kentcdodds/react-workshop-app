// eslint-disable-next-line import/no-unresolved
import {setup, rest} from '../server'

const getKey = (name: string) => `__react_workshop_app_${name}__`

setup({
  handlers: [
    rest.get('/get', (req, res, ctx) => res(ctx.json({success: true}))),
    rest.post('/post', (req, res, ctx) => res(ctx.json(req.body))),
  ],
})

const {env} = process
afterEach(() => {
  process.env = env
})

test('simple requests', async () => {
  const result = await window.fetch('/get').then(r => r.json())
  expect(result).toEqual({success: true})
})

test('GET request errors when passing a query param with the text "FAIL"', async () => {
  const result = await window.fetch('/get?fail=FAIL').then(r => r.json())
  expect(result).toEqual({
    status: 500,
    message: 'Request failure (for testing purposes).',
  })
})

test('POST request errors when passing a body with the text "FAIL"', async () => {
  const result = await window
    .fetch('/post', {method: 'POST', body: 'FAIL'})
    .then(r => r.json())
  expect(result).toEqual({
    status: 500,
    message: 'Request failure (for testing purposes).',
  })
})

test('failure rate request errors', async () => {
  window.localStorage.setItem(getKey('failure_rate'), 1)
  const result = await window.fetch('/get').then(r => r.json())
  expect(result).toEqual({
    status: 500,
    message: 'Request failure (for testing purposes).',
  })
})

test('fail config request errors', async () => {
  window.localStorage.setItem(
    getKey('request_fail_config'),
    JSON.stringify([{requestMethod: 'GET', urlMatch: '/get'}]),
  )
  const result = await window.fetch('/get').then(r => r.json())
  expect(result).toEqual({
    status: 500,
    message: 'Request failure (for testing purposes).',
  })
})

test('delay header', async () => {
  process.env.NODE_ENV = 'development'
  const start = Date.now()
  const delay = 100
  await window.fetch('/get', {headers: {delay}}).then(r => r.json())
  const end = Date.now()
  expect(end - start).toBeGreaterThanOrEqual(delay)
})

test('delay from localStorage', async () => {
  const start = Date.now()
  const variableTime = 30
  const minTime = 100
  window.localStorage.setItem(getKey('variable_request_time'), variableTime)
  window.localStorage.setItem(getKey('min_request_time'), minTime)
  process.env.NODE_ENV = 'development'
  await window.fetch('/get').then(r => r.json())
  const end = Date.now()
  expect(end - start).toBeGreaterThanOrEqual(minTime)
  const compensateForSlowCI = 100
  expect(end - start).toBeLessThanOrEqual(
    minTime + variableTime + compensateForSlowCI,
  )
})
