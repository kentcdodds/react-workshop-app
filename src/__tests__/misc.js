test('custom errors work', () => {
  expect(() =>
    // eslint-disable-next-line jest/valid-expect
    expect(1, 'one is not two').toBe(2),
  ).toThrowError(/one is not two/)
})
