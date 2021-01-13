import {alfredTip} from '../test-utils'

test('gives a nice error', () => {
  expect(() =>
    alfredTip(true, 'This is an extra error'),
  ).toThrowErrorMatchingInlineSnapshot(`"[31m🚨 This is an extra error[39m"`)
})

test('can use a function a nice error', () => {
  expect(() =>
    alfredTip(() => expect(true).toBe(false), 'This is an extra error'),
  ).toThrowErrorMatchingInlineSnapshot(`"[31m🚨 This is an extra error[39m"`)
})

test('does nothing if shouldThrow is false', () => {
  alfredTip(false, 'This is an extra error')
})
