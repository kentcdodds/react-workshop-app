import path from 'path'
import codegen from '../codegen'

const cwd = path.join(__dirname, 'fixtures/app1')

expect.addSnapshotSerializer({
  test(val) {
    return typeof val === 'string'
  },
  print(val) {
    return val.split(cwd).join('<PROJECT_ROOT>')
  },
})

test('review the snapshot please', () => {
  expect(codegen({cwd})).toMatchSnapshot()
})
