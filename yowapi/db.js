const { MongoClient } = require("mongodb")
const mongoHost = process.env.MONGO_HOST || 'localhost:27017'
const uri = `mongodb://${mongoHost}/?maxPoolSize=20&w=majority`
const client = new MongoClient(uri)

module.exports =  {
  get,
  create,
  getUser,
  createUser,
  getAllUsers,
  client, 
}

async function get(id) {
  const res = await client.db('yow').collection('games').findOne({ 'id': id }) 
  
  // clear the mongodb id, as the game id is all we need
  if (res !== null) res._id = undefined

  return res
}

async function create(game) {
  // create the entry if it doesn't exist already
  const res = await client.db("yow").collection('games').updateOne(  
    {id : game.id}, 
    {$setOnInsert: game},
    {upsert: true},
  )
  // throw new Error('Bad stuff')
  return res
}

async function getUser(id) {
  const res = await client.db('yow').collection('users').findOne({ 'id': id })

  // clear the mongodb id, as the user id is all we need
  if (res !== null) res._id = undefined
  return res
}

// currently just returns the count
async function getAllUsers() {
  //get count of all users
  let err = null
  const count = await client
    .db('yow')
    .collection('users')
    .countDocuments({})
    .catch((e) => err = e)

  if(err) {
    throw err
  }

  return { count }
}


async function createUser(user) {
  // create the entry if it doesn't exist already
  const res = await client.db("yow").collection('users').updateOne(
    {id: user.id},
    {$setOnInsert: user},
    {upsert: true},
  )
  return res
}
