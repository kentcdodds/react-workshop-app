// http://localhost:3000/isolated/examples/non-exported-example.js

import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return <div>Hello world in non-exported-example</div>
}

ReactDOM.render(<App />, document.getElementById('root'))
