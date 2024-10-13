import { MongoClient } from 'mongodb'
import lichessApi from './lichessApi.mjs'
import { writeFileSync, readFileSync } from 'fs'



// const yowGames = JSON.parse(readFileSync('missingGames.json'))
const yowGames = await getGames(100)

const gameIds = []
const yowGameMap = {}
for (const game of yowGames) {
  gameIds.push(game.id) 
  yowGameMap[game.id] = game
}


console.log('games found to process: ', gameIds.length)

const games = await getLichessGames(gameIds, yowGameMap) 
console.log('lichess games found: ', games.length)

const missingGames = findMissingGameIds(gameIds, games, yowGameMap)
console.log(`storing ${missingGames.length} yow game in missingGames.json`)

writeFileSync('missingGames.json', JSON.stringify(missingGames, null, 2))
await insertLichessGames(games)
const total = await getTotalLichessGames() 
console.log(total, " lichess games stored in db")





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
  let i = 1
  const games = []
  while ((game = await gameReader()) !== null) {
    game.cmp = yowGameMap[game.id].opponent
    games.push(game)
    process.stdout.write(`\r${i}`)
    i++
  }
  console.log()
  return games
} 


function findMissingGameIds(gameIds, games, yowGameMap) {
  const gameIdsSet = new Set(games.map(game => game.id))
  const missingIds =  gameIds.filter(id => !gameIdsSet.has(id))
  const missingGames = []
  for (const id of missingIds) {
    missingGames.push(yowGameMap[id])
  }
  return missingGames
}


async function insertLichessGames(games) {
  const uri = "mongodb://localhost:27017"
  const client = new MongoClient(uri)
  let err

  await client.connect().catch(e => {
    console.error("error connecting client: ", e)
    process.exit(1)
  })

  const collection = client.db('yow').collection('lichessGames')
  await collection.insertMany(games).catch(e => {
    console.error("error inserting games: ", e)
    process.exit(1)
  })

  await client.close().catch(e => {
    console.error("error closing client: ", e)
    process.exit(1)
  })
}


async function getTotalLichessGames() {
  const uri = "mongodb://localhost:27017"
  const client = new MongoClient(uri)
  
  await client.connect().catch(e => {
    console.error("error connecting client: ", e)
    process.exit(1)
  })
  
  const collection = client.db('yow').collection('lichessGames')
  const count = await collection.countDocuments().catch(e => {
    console.error("error counting games: ", e)
    process.exit(1)
  })
  
  await client.close().catch(e => {
    console.error("error closing client: ", e)
    process.exit(1)
  })
  
  return count


}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}