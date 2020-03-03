import './styles.css'
// I have no idea why this is happening...
import './server'
import codegen from 'codegen.macro'

// eslint-disable-next-line
codegen`module.exports = require('@kentcdodds/react-workshop-app/codegen')`
