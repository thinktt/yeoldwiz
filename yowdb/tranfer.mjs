import { MongoClient } from 'mongodb'
import lichessApi from './lichessApi.mjs'
import { serializePath } from 'whatwg-url'


const gameIds = await getGameIds(5)
console.log(gameIds)

let err 
const gameReader = await lichessApi.getGamesByIds(gameIds).catch(e => err = e)
if (err) {
  console.error("error: ", err)
}

let game
let i = 0
const games = []
while ((game = await gameReader()) !== null) {
  console.log(game)
  games.push(game)
}

console.log(games.length)





async function getGameIds(count) {
  if (!count) count = 1

  const uri = "mongodb://localhost:27017" // Change this to your MongoDB connection string
  const client = new MongoClient(uri)

  let err

  // Connect client with Go-like error handling
  await client.connect().catch(e => err = e)
  if (err) {
    console.error("error connecting client: ", err)
    return
  }

  // Get the database and collection
  const database = client.db('yow') 
  const collection = database.collection('games')

  // fetch the games
  let games = await collection
    .find({})
    .limit(count)
    .toArray()
    .catch(e => err = e)

  if (err) {
    console.error("error querying games: ", err)
    await client.close()
    return
  }

  // console.log(games)

  // Extract game IDs into a string array
  const gameIds = games.map(game => game.id)

  // Close client with Go-like error handling
  await client.close().catch(e => err = e)
  if (err) {
    console.error("error closing client: ", err)
  }

  return gameIds
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}