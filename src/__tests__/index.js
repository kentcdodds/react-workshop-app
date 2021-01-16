// This file cannot be in TypeScript because it imports files from the exercises
// directory which leads to all the TS defs being generated with the wrong file structure during the build
import path from 'path'
import ReactDOM from 'react-dom'
import matchMediaPolyfill from 'mq-polyfill'
import {screen, fireEvent} from '@testing-library/react'
import {makeKCDWorkshopApp} from '..'
import {getAppInfo} from '../get-app-info'

beforeAll(() => {
  matchMediaPolyfill(window)
})

let root
beforeEach(() => {
  root = document.createElement('div')
  root.id = 'root'
  document.body.append(root)
})

afterEach(() => {
  if (root) ReactDOM.unmountComponentAtNode(root)
  // no idea, but I was getting "NotFoundError: The node to be removed is not a child of this node."
  // so we'll reset the innerHTML
  // document.body.removeChild(root)
  document.body.innerHTML = ''
})

test('regular app', () => {
  const {filesInfo, gitHubRepoUrl} = getAppInfo({
    cwd: path.join(process.cwd(), 'example/react-fundamentals'),
  })

  makeKCDWorkshopApp({
    imports: {
      'src/exercise/05.js': () =>
        import('../../example/react-fundamentals/src/exercise/05.js'),
      'src/exercise/05.md': () =>
        import('../../example/react-fundamentals/src/exercise/05.md'),
      'src/final/05.js': () =>
        import('../../example/react-fundamentals/src/final/05.js'),
      'src/final/05.extra-1.js': () =>
        import('../../example/react-fundamentals/src/final/05.extra-1.js'),
    },
    filesInfo,
    gitHubRepoUrl,
    projectTitle: 'test project',
    backend: require('../../example/react-fundamentals/src/backend'),
  })

  fireEvent.click(
    screen.getByRole('heading', {
      name: /styling/i,
    }),
  )
})

// TODO: fix this test
test.skip('isolated page', async () => {
  const {filesInfo, gitHubRepoUrl} = getAppInfo({
    cwd: path.join(process.cwd(), 'example/react-fundamentals'),
  })

  window.history.pushState({}, 'Test page', '/isolated/final/05.js')

  makeKCDWorkshopApp({
    imports: {
      'src/exercise/05.js': () =>
        import('../../example/react-fundamentals/src/exercise/05.js'),
      'src/exercise/05.md': () =>
        import('../../example/react-fundamentals/src/exercise/05.md'),
      'src/final/05.js': () =>
        import('../../example/react-fundamentals/src/final/05.js'),
      'src/final/05.extra-1.js': () =>
        import('../../example/react-fundamentals/src/final/05.extra-1.js'),
    },
    filesInfo,
    gitHubRepoUrl,
    projectTitle: 'test project',
    backend: require('../../example/react-fundamentals/src/backend'),
  })

  await screen.findByText('large orange box')
})

/*
eslint
  import/no-unresolved: "off",
*/
