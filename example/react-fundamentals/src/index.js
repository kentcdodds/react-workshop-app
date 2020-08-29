import './styles.css'
import './test/server'
import codegen from 'codegen.macro'

// eslint-disable-next-line
codegen`module.exports = require('@kentcdodds/react-workshop-app/codegen')({
  options: {concurrentMode: true},
})`
