import React from 'react'
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  act,
} from '@testing-library/react'
import App1 from './fixtures/app1/src'

test('lib should be tested', async () => {
  render(<App1 />)

  expect(document.title).toBe(App1.projectTitle)
  expect(screen.getByText(App1.projectTitle)).toBeInTheDocument()

  // test normal exercise page
  fireEvent.click(await screen.findByText('01 Example'))

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))

  const exercise1Path = window.location.pathname
  expect(screen.queryByLabelText(/previous/i)).not.toBeInTheDocument()
  expect(screen.getByTestId('MockExercise')).toBeInTheDocument()
  expect(screen.getByTestId('MockFinal')).toBeInTheDocument()
  expect(screen.queryByLabelText(/next/i)).toBeInTheDocument()

  expect(screen.getByText('01 Example')).toBeInTheDocument()

  fireEvent.click(screen.getByText(/Exercise/i))
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))

  expect(screen.getByTestId('MockExercise')).toBeInTheDocument()
  expect(screen.queryByTestId('MockFinal')).not.toBeInTheDocument()

  act(() => {
    window.appHistory.push(exercise1Path)
  })

  fireEvent.click(screen.getByText(/Final/i))

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))

  expect(screen.getByTestId('MockFinal')).toBeInTheDocument()
  expect(screen.queryByTestId('MockExercise')).not.toBeInTheDocument()

  act(() => {
    window.appHistory.push(exercise1Path)
  })

  // test extra credits
  fireEvent.click(screen.getByText('02 Example'))
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  const exercise2Path = window.location.pathname
  expect(screen.getByText(/extra credits:/i)).toBeInTheDocument()

  fireEvent.click(screen.getByText('Extra 1'))
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))

  expect(document.body).toHaveClass('_isolated_exercises-final_02-extra.1')
  expect(screen.getByTestId('MockFinal')).toBeInTheDocument()

  act(() => {
    window.appHistory.push(exercise2Path)
  })

  // page 3
  fireEvent.click(screen.getByLabelText(/next/i))
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  expect(screen.queryByLabelText(/next/i)).not.toBeInTheDocument()

  // example
  act(() => {
    window.appHistory.push('/isolated/examples/example')
  })
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i))
  expect(screen.getByTestId('MockExample')).toBeInTheDocument()

  // 404
  act(() => {
    window.appHistory.push('/isolated/no')
  })
  expect(screen.getByText(/sorry/i)).toBeInTheDocument()
})
