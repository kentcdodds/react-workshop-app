import {rest} from '@kentcdodds/react-workshop-app/server'

export const handlers = [
  rest.post('*/user', (req, res, {status, json}) => {
    const {username} = req.body
    return res(
      // set custom status
      status(200),
      // send JSON response body
      json({username, mocked: true}),
    )
  }),
]
