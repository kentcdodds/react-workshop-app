import codegen from 'codegen.macro'

// eslint-disable-next-line babel/no-unused-expressions
codegen`
module.exports = require('../../../../codegen')({cwd: __dirname}).replace('@kentcdodds/react-workshop-app', '../../../../')
`
