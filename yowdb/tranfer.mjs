import { MongoClient } from 'mongodb'
import lichessApi from './lichessApi.mjs'


const yowGames = await getGames(5)
// const gameIds = await getGameIds(5)


const gameIds = []
const yowGameMap = {}
for (const game of yowGames) {
  gameIds.push(game.id) 
  yowGameMap[game.id] = game
}


console.log('games found to process: ', gameIds.length)
console.log(gameIds)

let games = await getLichessGames(gameIds, yowGameMap) 
console.log('lichess games found: ', games.length)
console.log(games) 



async function getGames(count) {
  const uri = "mongodb://localhost:27017"
  const client = new MongoClient(uri)
  let err

  await client.connect().catch(e => err = e)
  if (err) return console.error("error connecting client: ", err)

  const collection = client.db('yow').collection('games')
  const games = await collection.find({}).limit(count).toArray().catch(e => err = e)

  if (err) return console.error("error querying games: ", err)

  await client.close().catch(e => console.error("error closing client: ", err))

  return games
}


async function getLichessGames(ids, yowGameMap) {
  let err 
  const gameReader = await lichessApi.getGamesByIds(ids).catch(e => err = e)
  if (err) {
    console.error("error: ", err)
  }
  
  let game
  let i = 0
  const games = []
  while ((game = await gameReader()) !== null) {
    game.cmp = yowGameMap[game.id].opponent
    games.push(game)
  }
  return games
} 


function findMissingGameIds(gameIds, games) {
  const gameIdsSet = new Set(games.map(game => game.id))
  return gameIds.filter(id => !gameIdsSet.has(id))
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}