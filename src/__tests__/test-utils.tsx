import {alfredTip} from '../test-utils'

test('alfred tips work', () => {
  expect(() =>
    alfredTip(() => expect(1).toBe(2), 'one is not two'),
  ).toThrowError(/one is not two/)
})

test('gives a nice error', () => {
  expect(() => alfredTip(true, 'This is an extra error')).toThrow()
})

test('can use a function a nice error', () => {
  expect(() =>
    alfredTip(() => expect(true).toBe(false), 'This is an extra error'),
  ).toThrowError(/this is an extra error/i)
})

test('does nothing if shouldThrow is false', () => {
  alfredTip(false, 'This is an extra error')
})

test('prints an element', () => {
  expect(() =>
    alfredTip(true, 'oh no', {displayEl: () => document.createElement('div')}),
  ).toThrowError(/oh no.*<div \/>/is)
})
