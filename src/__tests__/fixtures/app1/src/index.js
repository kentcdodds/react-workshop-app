import React from 'react'
import preval from 'preval.macro'
import createKCDWorkshopApp from '../../../../'

const exerciseInfo = preval`
const path = require('path')
const loadExercises = require('../../../../load-exercises')
const cwd = path.join(process.cwd(), 'src/__tests__/fixtures/app1')
module.exports = loadExercises(cwd)
`
const MockExercise = jest.fn(() => <div data-testid="MockExercise" />)
const getExerciseImport = jest.fn(() => () =>
  Promise.resolve({default: MockExercise}),
)

const MockFinal = jest.fn(() => <div data-testid="MockFinal" />)
const getFinalImport = jest.fn(() => () =>
  Promise.resolve({default: MockFinal}),
)

const MockExample = jest.fn(() => <div data-testid="MockExample" />)
const getExampleImport = jest.fn(() => () =>
  Promise.resolve({default: MockExample}),
)

const fakeFetchResponses = [{test: jest.fn(), handler: jest.fn()}]
const projectTitle = 'Test Project'

const WorkshopApp = createKCDWorkshopApp({
  getExerciseImport,
  getFinalImport,
  getExampleImport,
  exerciseInfo,
  fakeFetchResponses,
  projectTitle,
})

Object.assign(WorkshopApp, {
  exerciseInfo,
  MockExercise,
  getExerciseImport,
  MockFinal,
  getFinalImport,
  MockExample,
  getExampleImport,
  fakeFetchResponses,
  projectTitle,
})

export default WorkshopApp
