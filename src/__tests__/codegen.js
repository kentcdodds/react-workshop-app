import path from 'path'
import codegen from '../codegen'

const cwd = path
  .join(__dirname, '../../example/react-fundamentals')
  .split(path.sep)
  .join('/')

expect.addSnapshotSerializer({
  test(val) {
    return typeof val === 'string'
  },
  print(val) {
    if (process.platform === 'win32') {
      val = val.replace(/\\\\/g, '/')
    }
    return val.split(cwd).join('<PROJECT_ROOT>')
  },
})

test('review the snapshot please', () => {
  expect(codegen({cwd})).toMatchSnapshot()
})
