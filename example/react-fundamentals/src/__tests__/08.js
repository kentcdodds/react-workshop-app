import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import Usage from '../final/08'
// import Usage from '../exercise/08'

beforeAll(() => {
  jest.spyOn(console, 'info').mockImplementation(() => {})
})

beforeEach(() => {
  console.info.mockClear()
})

test('calls the onSubmitUsername handler when the submit is fired', async () => {
  window.fetch.mockImplementationOnce((url, config) =>
    Promise.resolve({
      json: () => Promise.resolve({username: JSON.parse(config.body).username}),
    }),
  )
  const {getByLabelText, getByText} = render(<Usage />)
  const input = getByLabelText(/username/i)
  const submit = getByText(/submit/i)

  let value = 'A'
  fireEvent.change(input, {target: {value}})
  expect(input.value).toBe('a')
  fireEvent.click(submit)

  await waitFor(() => {
    expect(console.info).toHaveBeenCalledWith('username', input.value)
    expect(console.info).toHaveBeenCalledTimes(1)
  })
})
