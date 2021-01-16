import path from 'path'
import {getCode} from '../codegen'

const cwd = path
  .join(__dirname, '../../example/react-fundamentals')
  .split(path.sep)
  .join('/')

expect.addSnapshotSerializer({
  test(val: unknown): val is string {
    return typeof val === 'string'
  },
  print(val: unknown) {
    if (process.platform === 'win32') {
      val = (val as string).replace(/\\\\/g, '/')
    }
    return (val as string).split(cwd).join('<PROJECT_ROOT>')
  },
})

test('review the snapshot please', () => {
  expect(getCode({cwd})).toMatchSnapshot()
})
