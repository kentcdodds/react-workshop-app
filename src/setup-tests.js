import '@testing-library/jest-dom/extend-expect'
import './jest-expect-message'

beforeAll(() => {
  jest.spyOn(console, 'info')
  console.info.mockImplementation(() => {})
})
afterAll(() => console.info.mockRestore())
beforeEach(() => console.info.mockClear())
