import chalk from 'chalk'

function alfredTip(shouldThrow, tip) {
  if (typeof shouldThrow === 'function') {
    try {
      shouldThrow = shouldThrow()
    } catch {
      shouldThrow = true
    }
  }
  if (!shouldThrow) return

  const error = new Error(chalk.red(`🚨 ${tip}`))
  // get rid of the stack to avoid the noisy codeframe
  error.stack = ''
  throw error
}

export {alfredTip}
