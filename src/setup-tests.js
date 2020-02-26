import '@testing-library/jest-dom/extend-expect'
import './jest-expect-message'

beforeAll(() => {
  jest.spyOn(console, 'info')
  console.info.mockImplementation(() => {})
})
afterAll(() => console.info.mockRestore())
beforeEach(() => console.info.mockClear())

window.fetch = window.fetch || (async () => {})
jest.spyOn(window, 'fetch')
afterAll(() => {
  window.fetch.mockRestore()
})

beforeEach(() => {
  window.fetch.mockImplementation((...args) => {
    console.warn('window.fetch is not mocked for this call', ...args)
    return Promise.reject(new Error('This must be mocked!'))
  })
})

afterEach(() => {
  window.fetch.mockClear()
})
