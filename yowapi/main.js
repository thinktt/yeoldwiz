const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient } = require("mongodb")
const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority"
const client = new MongoClient(uri)
const Ajv = require("ajv")
const ajv = new Ajv()

const gameSchema = {
  type: "object",
  properties: {
    id: {type: "string", pattern: "^[a-zA-Z0-9]{8}$" },
    opponent: {
      type: "string", 
      // enum: ["Marius", "Orin"],
      pattern: "^[a-zA-Z0-9]*$",
    }
  },
  required: ["id", "opponent"],
  additionalProperties: false
}

app.use(express.json())

app.get('/games/:id', async (req, res) => {
  
  let [result, err] = await safeCall(get(req.params.id))
  if (err) {
    res.status(500) 
    res.json({message: err.mesage})
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

  const valid = ajv.validate(gameSchema, req.body)
  if (!valid) {
    res.status(400)
    res.json(ajv.errors[0])
    return
  }

  const game = req.body

  let [result, err] = await safeCall(create(game))
  if (err) {
    res.status(500) 
    res.json({message: err.mesage})
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

// catch all error handler
app.use((err, req, res, next) => {
  if (err.statusCode) res.status(err.statusCode)
    else res.statusCode(500)
  res.json({ error: err.toString() })
})


async function get(id) {
  try {
    await client.connect()
    const res = await client.db('yow').collection('games').findOne({ 'id': id }) 
    return res

  } finally {
    await client.close()
  }
}

async function create(game) {
  try {
    // Connect the client to the server
    await client.connect()
    
    // create the entry if it doesn't exist already
    const res = await client.db("yow").collection('games').updateOne(  
      {id : game.id}, 
      {$setOnInsert: game},
      {upsert: true},
    )
    return res

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}
// create('duperduperd').catch(console.dir)

app.listen(port, () => console.log(`Server started on port ${port}`))

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
  return 'Howdy!'
}

async function main() {
  let [a, err] = await safeCall(throwErr())
  if (err) {
    console.log(`There was an error: ${err.message}`)
    return
  }
  console.log(a)
}

// main()


// const fetch = require('node-fetch')
// const request = require('request')

// const express = require('express')

// const fetch = require('node-fetch')
// const request = require('request')

// const app = express()
// const port = process.env.PORT || 5000


// app.get('/health', (req, res) => {
//   res.json({'status': 'ok'})
// })

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin")
//   res.setHeader("Access-Control-Allow-Origin", "*")
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
//   res.setHeader("Access-Control-Allow-Credentials", true)
//   next()
// })

// app.get('/token', async (req, res) => {
//   const auth = 'TDQ3VHFwWm43aWFKcHBHTTpDZGY3aGxhSndKbWVyd2JESEZ1cWxQQVVnR1U3eGtTNw=='
  
//   console.log('Received a code at ' + req.headers.host)
//   console.log('Redirect url is set to ' + req.query.redirect_uri)

//   const query =  `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${req.query.redirect_uri}`
//   // console.log(query)
//   // console.log(auth)

//   fetch('https://oauth.lichess.org/oauth', {
//     body: query,
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': `Basic ${auth}` ,
//     },
//   })
//   .then(lires => {
//     if (!lires.ok) {
//       // console.log(lires)
//       res.status(400).json({ error: lires.statusText });
//       throw new Error(res.statusText);
//     } 
//     return lires.json()
//   })
//   .then(data => {
//      res.json(data)
//   })
//   .catch(err => {
//     console.log(err)
//     res.status(400).send('Error getting token')
//   })

// });

// // app.get('/games/:gameId', (req, res) => {
// //   fetch(`https://lichess.org/${req.params.gameId}`)
// //   .then(lires => lires.text())
// //   .then(data => {
// //     res.send(data)
// //   })
// //   .catch(err => {
// //     console.log(err)
// //     res.status(400).send("Error getting the game")
// //   })
// // })

// app.get('/games/:gameId', (req, res) => {
//   req.pipe(request("https://lichess.org/" + req.params.gameId)).pipe(res);
// })



