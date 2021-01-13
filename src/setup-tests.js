import path from 'path'
import fs from 'fs'
import '@testing-library/jest-dom/extend-expect'
import {configure} from '@testing-library/react'
import {setup} from './server'

// for slower computers
configure({asyncUtilTimeout: 4000})

beforeAll(() => {
  jest.spyOn(console, 'info')
  console.info.mockImplementation(() => {})
})
afterAll(() => console.info.mockRestore())
beforeEach(() => console.info.mockClear())

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
const cwd = process.cwd()
const backendFilePath = [
  path.join(cwd, 'src/backend.js'),
  path.join(cwd, 'src/backend.ts'),
  path.join(cwd, 'src/backend.tsx'),
].find(p => fs.existsSync(p))
const backend = {handlers: [], onUnhandledRequest: 'error'}
if (backendFilePath) {
  // we do things this way to trick webpack into not realizing this is
  // a dynamic require (because we don't run this file with webpack, so who cares)
  // but we get warnings if we do a regular require here...
  // eslint-disable-next-line
  Object.assign(backend, module.require.call(module, backendFilePath))
}
const server = setup(backend)

beforeAll(() => server.listen(backend))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
