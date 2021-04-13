import chalk from 'chalk'

function alfredTip(
  shouldThrow: unknown | (() => unknown),
  tip: string | (() => string),
) {
  if (typeof shouldThrow === 'function') {
    try {
      shouldThrow = shouldThrow()
    } catch {
      shouldThrow = true
    }
  }
  if (!shouldThrow) return

  const tipString = typeof tip === 'function' ? tip() : tip
  const error = new Error(chalk.red(`🚨 ${tipString}`))
  // get rid of the stack to avoid the noisy codeframe
  error.stack = ''
  throw error
}

export {alfredTip}
