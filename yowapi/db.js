const { MongoClient } = require("mongodb")
const mongoHost = process.env.MONGO_HOST || 'localhost:27017'
const uri = `mongodb://${mongoHost}/?maxPoolSize=20&w=majority`
const client = new MongoClient(uri)

module.exports =  {
  getGame,
  createGame,
  getUser,
  createUser,
  getAllUsers,
  deleteUser,
  client, 
}
async function createGame(game) {
  // create the entry if it doesn't exist already
  const res = await client.db("yow").collection('games').updateOne(  
    {id : game.id}, 
    {$setOnInsert: game},
    {upsert: true},
  )
  // throw new Error('Bad stuff')
  return res
}

async function getGame(id) {
  const res = await client.db('yow').collection('games').findOne({ 'id': id }) 
  
  // clear the mongodb id, as the game id is all we need
  if (res !== null) res._id = undefined

  return res
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
  const users = await client
    .db('yow')
    .collection('users')
    .find({}, { projection: {id: 1, _id: 0} })
    .toArray()
    .catch((e) => err = e);
  
  const ids = users.map(user => user.id)
  
  if(err) {
    throw err
  }

  return { count: ids.length, ids }
}

async function deleteUser(userId) {
  const res = await client
    .db("yow")
    .collection('users')
    .deleteOne({id: userId})
  return res;
}





