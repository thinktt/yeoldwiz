const { MongoClient } = require("mongodb")
const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority"
const client = new MongoClient(uri)

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


module.exports =  {
  get,
  create,
  client, 
}