const express = require('express')
require('express-async-errors')
const king = require('./king')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 64355
const Ajv = require("ajv")
const ajv = new Ajv()
const db = require('./db')
const schema = require('./schema')



app.use(express.json({limit: '300kb'}))
app.use(cors())


app.get('/health', async (rec, res) => {
  res.json({message: 'API is healthy'})
})

app.get('/users/', async (req, res) => {
  let err = null  
  const users = await db.getAllUsers().catch((e) => err = e)
  if (err) {
    res.status(500)
    res.json('error getting users', err.message)
    return
  }

  res.json(users)
})

app.get('/users/:id', async (req, res) => {
  let [result, err] = await safeCall(db.getUser(req.params.id))
  if (err) {
    res.status(500)
    res.json(err)
    return
  }

  if (!result) {
    res.status(404)
    res.json({ message: `no user found for id ${req.params.id}` })
    return
  }

  res.json(result)
})

app.post('/users', async (req, res) => {
  const valid = ajv.validate(schema.user, req.body)
  if (!valid) {
    res.status(400)
    res.json(ajv.errors[0])
    return
  }

  const user = req.body

  const kingCmVersion = await king.getVersion(user.kingBlob)
  if (!kingCmVersion) {
    res.status(400)
    res.json({ message: 'king blob is not valid' })
    return
  }

  // swap out the blob for the kingCmVersion for storage
  user.kingCmVersion = kingCmVersion
  delete user.kingBlob
  
  let [result, err] = await safeCall(db.createUser(user))
  if (err) {
    res.status(500)
    res.json({message: err.message})
    return
  }
  
  // this means mogoDB already had this id the DB so it didn't make a new one
  if (result.matchedCount) {
    res.status(200)
    res.json({message: `user ${user.id} already exist, no new creation`})
    return
  }

  res.status(201)
  res.json({message: `user ${user.id} successfully added`})
})

app.get('/games/:id', async (req, res) => {
  let [result, err] = await safeCall(db.get(req.params.id))
  if (err) {
    res.status(500) 
    res.json(err)
    return 
  }

  if (!result) {
    res.status(404)
    res.json({ message: `no game found for id ${req.params.id}` })
    return 
  }
  
  res.json(result)
})

app.post('/games', async (req, res) => {

  const valid = ajv.validate(schema.game, req.body)
  if (!valid) {
    res.status(400)
    res.json(ajv.errors[0])
    return
  }

  const game = req.body

  let [result, err] = await safeCall(db.create(game))
  if (err) {
    res.status(500) 
    res.json({message: err.message})
    return 
  }

  // this means mogoDB already had this id the DB so it didn't make a new one
  if (result.matchedCount) {
    res.status(200)
    res.json({message: `game ${game.id} already exist, no new creation`})
    return
  }

  res.status(201)
  res.json({message: `game ${game.id} successfully added`})
})

app.get('*', (req, res) => {
  res.status(404)
  res.json({message: 'no such route'});
})

// catch all for unprocessed errors
app.use((err, req, res, next) => {
  if (err) {
    res.status(500)
    res.json({ error: err.toString() })
  }
 
})


async function start() {
  await db.client.connect()
  app.listen(port, () => console.log(`Server started on port ${port}`))
}
start()


// allows you to safely call an asycn function and easily handle errors
// with a Golang style if error statement
async function safeCall(promise) {
 try {
   const res = await promise
   return [res, null]
 } catch (err) {
   return [null, err]
 }
}

async function throwErr() {
  throw Error('Bad stuff')
}

async function main() {
  let [a, err] = await safeCall(throwErr())
  if (err) {
    console.log(`There was an error: ${err.message}`)
    return
  }
  console.log(a)
}
