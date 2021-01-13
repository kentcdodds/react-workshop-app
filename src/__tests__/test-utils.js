import {alfredTip} from '../test-utils'

test('gives a nice error', () => {
  expect(() => alfredTip(true, 'This is an extra error')).toThrow()
})

test('can use a function a nice error', () => {
  expect(() =>
    alfredTip(() => expect(true).toBe(false), 'This is an extra error'),
  ).toThrow()
})

test('does nothing if shouldThrow is false', () => {
  alfredTip(false, 'This is an extra error')
})
