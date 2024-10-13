import { MongoClient } from 'mongodb'
import Chess from "./chess.js"

const games = await getAllLichessGames()
console.log('Total games:', games.length)


const humanGames = []
const botGames = []
const humanMap = {}
const botMap = {}

for (const game of games) {
  if (isHumanGame(game)) {
    humanGames.push(game)
    updateUserMap(humanMap, game) 
    continue
  } 

  botGames.push(game) 
  updateUserMap(botMap, game)
}


console.log('Human games:', humanGames.length)
console.log('Bot games:', botGames.length)

// printSortedUsersByGameCount(humanMap)
// printSortedUsersByLastMove(humanMap) 
// printSortedUsersByGameCount(botMap)
// const { statusMap, winnerMap } = generateGameStats(humanGames)









function generateGameStats(games) {
  const winnerMap = {}
  const statusMap = {}

  for (const game of games) {
    const { winner, status } = game

    if (!winnerMap[winner]) winnerMap[winner] = 1
    else winnerMap[winner]++

    if (!statusMap[status]) statusMap[status] = 1
    else statusMap[status]++
  }

  return { winnerMap, statusMap }
}


function getDrawType(conclusion, moves) {
  if (conclusion !== 'draw') return null
  const chess = new Chess() 
  for (const move of moves) {
    chess.move(move, { sloppy: true }) 
  }
  if (chess.insufficient_material()) return "material"
  if (chess.in_stalemate()) return "stalemate"
  if (chess.in_threefold_repetition()) return "threefold"
  if (chess.in_draw()) return "fiftyMove"
  return "mutual"
}

function printSortedUsersByGameCount(userMap) {
  const sortedUsers = Object.entries(userMap)
    .sort(([, a], [, b]) => b.gameCount - a.gameCount)

  sortedUsers.forEach(([name, user]) => {
    const date = new Date(user.lastMoveAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    console.log(`${name}: ${user.gameCount} games, last move at ${date}`)
  })
}

function printSortedUsersByLastMove(userMap) {
  const sortedUsers = Object.entries(userMap)
    .sort(([, a], [, b]) => b.lastMoveAt - a.lastMoveAt)

  sortedUsers.forEach(([name, user]) => {
    const date = new Date(user.lastMoveAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    console.log(`${name}: ${user.gameCount} games, last move at ${date}`)
  })
}

function updateUserMap(userMap, game) {
  const whitePlayer = game.players.white.user 
  const blackPlayer = game.players.black.user
  let user
  if (whitePlayer.name !== 'yeoldwiz' && whitePlayer.name !== 'yowCapablanca' ) {
    user = whitePlayer
  } else {
    user = blackPlayer
  }

  const name = user.name
  
  // this is the first occurance of this user
  if (!userMap[name]) {
    userMap[name] = { gameCount: 1, lastMoveAt: game.lastMoveAt }
    return userMap
  } 

  userMap[name].gameCount ++

  if (game.lastMoveAt > userMap[name].lastMoveAt) { 
    userMap[name].lastMoveAt = game.lastMoveAt
  }  
  return userMap 
}


function isHumanGame(game) {
  const whitePlayer = game.players.white.user 
  const blackPlayer = game.players.black.user

  if (whitePlayer.title === 'BOT' && blackPlayer.title === 'BOT') {
    return false
  }

  return true
}


async function getAllLichessGames() {
  const uri = "mongodb://localhost:27017"
  const client = new MongoClient(uri)
  let err

  await client.connect().catch(e => {
    console.error("error connecting client: ", e)
    process.exit(1)
  })

  const collection = client.db('yow').collection('lichessGames')
  const games = await collection.find({}).toArray().catch(e => {
    console.error("error fetching games: ", e)
    process.exit(1)
  })

  await client.close().catch(e => {
    console.error("error closing client: ", e)
    process.exit(1)
  })

  return games
}
