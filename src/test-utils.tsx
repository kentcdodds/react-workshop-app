import chalk from 'chalk'

function alfredTip(
  shouldThrow: unknown | (() => unknown),
  tip: string | ((error: unknown) => string),
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
  // get rid of the stack to avoid the noisy codeframe
  error.stack = ''
  throw error
}

export {alfredTip}
