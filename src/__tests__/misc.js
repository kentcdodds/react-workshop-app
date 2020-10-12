import {alfredTip} from '../test-utils'

test('alfred tips work', () => {
  expect(() =>
    alfredTip(() => expect(1).toBe(2), 'one is not two'),
  ).toThrowError(/one is not two/)
})
