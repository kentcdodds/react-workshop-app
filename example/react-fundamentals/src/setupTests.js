import '@kentcdodds/react-workshop-app/setup-tests'
import {server} from './test/server'

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
