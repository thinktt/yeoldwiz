import { MongoClient } from 'mongodb'
import lichessApi from './lichessApi.mjs'


const gameIds = await getGameIds(5000)
console.log('games found to process: ', gameIds.length)

// let games = await getLichessGames(gameIds) 
// console.log('lichess games found: ', games.length)

// let missingIds = findMissingGameIds(gameIds, games)
// console.log('number of missing gamesIds: ', missingIds.length)
// console.log('missing games:', missingIds)

// console.log('........pass 2....') 
// games = await(getLichessGames(missingIds))
// console.log('lichess games found: ', games.length)
// missingIds = findMissingGameIds(missingIds, games)
// console.log('number of missing gamesIds: ', missingIds.length)
// console.log('missing games:', missingIds)


function mergeGames(lichessGames, yowGames) {
  const yowGamesMap = new Map(yowGames.map(game => [game.id, game]))
  const missingGames = []

  lichessGames.forEach(game => {
    const yowGame = yowGamesMap.get(game.id)
    if (yowGame) {
      game.cmp = yowGame.opponent
    } else {
      missingGames.push(game.id)
    }
  })

  return { mergedGames: lichessGames, missingGames }
}


function findMissingGameIds(gameIds, games) {
  const gameIdsSet = new Set(games.map(game => game.id))
  return gameIds.filter(id => !gameIdsSet.has(id))
}

async function getLichessGames(ids) {
  let err 
  const gameReader = await lichessApi.getGamesByIds(ids).catch(e => err = e)
  if (err) {
    console.error("error: ", err)
  }
  
  let game
  let i = 0
  const games = []
  while ((game = await gameReader()) !== null) {
    // console.log(game)
    games.push(game)
  }
  return games
} 


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
    // .limit(count)
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