import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import Usage from '../final/08'
// import Usage from '../exercise/08'

test('calls the onSubmitUsername handler when the submit is fired', async () => {
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
