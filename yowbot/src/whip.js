const express = require('express')
const app = express()
const port = 3000

let stream
let lastWhipEvent = Date.now()
let lastStreamEvent = Date.now()

module.exports = {
  start,
}

app.get('/whip', async (rec, res) => {
  lastWhipEvent = Date.now()
  res.json({lastWhipEvent})
  // stream.abort()
  process.exit()
})

app.get('/*', async (rec, res) => {
  res.status(404).json({message: 'no such route'})
})

function start(controller) {
  stream = controller
  app.listen(port, () => console.log(`Started Whip API on port ${port}`))
}

