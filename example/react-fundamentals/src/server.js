import {composeMocks, rest} from 'msw'

// Configure mocking routes
const {start} = composeMocks(
  rest.post('*/user', (req, res, {status, set, delay, json}) => {
    // access request's params
    const {username} = req.body

    return res(
      // set custom status
      status(200),

      // delay the response
      delay(1000),

      // send JSON response body
      json({username, mocked: true}),
    )
  }),
)

start('/mockServiceWorker.js')
