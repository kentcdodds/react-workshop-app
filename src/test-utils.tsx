import chalk from 'chalk'
import {prettyDOM} from '@testing-library/react'

function alfredTip(
  shouldThrow: unknown | (() => unknown),
  tip: string | ((error: unknown) => string),
  {displayEl}: {displayEl?: true | ((error: unknown) => HTMLElement)} = {},
) {
  let caughtError
  if (typeof shouldThrow === 'function') {
    try {
      shouldThrow = shouldThrow()
    } catch (e: unknown) {
      shouldThrow = true
      caughtError = e
    }
  }
  if (!shouldThrow) return

  const tipString = typeof tip === 'function' ? tip(caughtError) : tip
  const error = new Error(chalk.red(`🚨 ${tipString}`))
  if (displayEl) {
    const el =
      typeof displayEl === 'function' ? displayEl(caughtError) : document.body
    error.message += `\n\n${chalk.reset(prettyDOM(el))}`
  }
  // get rid of the stack to avoid the noisy codeframe
  error.stack = error.message
  throw error
}

export {alfredTip}
