import {setupServer} from 'msw/node'
import {handlers} from './handlers'

const server = setupServer(...handlers)

export {server}
