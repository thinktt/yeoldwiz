import { MongoClient } from 'mongodb'
import { Chess } from "./chess.js"
import yowApi from "./yowApi.mjs"

const games = await getAllLichessGames()
console.log('Total games:', games.length)


const humanGames = []
const botGames = []
const devGames = []
const humanMap = {}
const botMap = {}

for (const game of games) {
  if (isDevGame(game)) {
    devGames.push(game)
    continue
  }


  if (isHumanGame(game)) {
    humanGames.push(game)
    updateUserMap(humanMap, game) 
    continue
  } 

  botGames.push(game) 
  updateUserMap(botMap, game)
}

console.log('Dev games:', devGames.length)
console.log('Human games:', humanGames.length)
console.log('Bot games:', botGames.length)


// for (const game of humanGames) {
//   translateToYowGame(game)
// }

const lichessToken = process.env.TOKEN
if (!lichessToken) {
  console.error('TOKEN not found in environment. Please source .env.')
  process.exit(1)
}

await yowApi.getToken(lichessToken)

let i = 1
let err
for (const game of humanGames) {
  const yowGame = translateToYowGame(game)

  
  await yowApi.addHistoricalGame(yowGame).catch(e => err = e)
  if (err) {
    console.error(`\n${game.id} failed to upload: ${err}`)
    console.log(game)
    console.log(yowGame)
    err = null
    continue
  }

  process.stdout.write(`\r${i}`)
  i++
}

console.log('done')


// const yowGame = translateToYowGame(humanGames[0])
// const testGame = humanGames[0]
// console.log(testGame)
// console.log(testGame.players)
// console.log(yowGame)

// printSortedUsersByGameCount(humanMap)
// printSortedUsersByLastMove(humanMap) 
// printSortedUsersByGameCount(botMap)
// const { statusMap, winnerMap } = generateGameStats(humanGames)
// console.log(statusMap)


// const drawMap = generateDrawMap(humanGames)
// console.log(drawMap)





function translateToYowGame(game) {
  const yowGame = {
    id: game.id,
    lichessId: game.id,
    createdAt: game.createdAt,
    lastMoveAt: game.lastMoveAt,
    winner: undefined,
    method: undefined,
    moves: game.moves,
    whitePlayer: {},
    blackPlayer: {},
    whiteWillDraw : false,
    blackWillDraw : false
  }

  const whiteUser = game.players.white.user 
  const blackUser = game.players.black.user

  // map the players to their correct locations replacing lichesss bot with cmp
  if (whiteUser.name === 'yeoldwiz') {
    yowGame.whitePlayer = { id: game.cmp, type: 'cmp' }
    yowGame.blackPlayer = { id: blackUser.name.toLowerCase(), type: 'lichess'} 
  } else if (blackUser.name === 'yeoldwiz') {
    yowGame.blackPlayer = { id: game.cmp, type: 'cmp' }
    yowGame.whitePlayer = { id: whiteUser.name.toLowerCase(), type: 'lichess'} 
  } else {
    console.error('yeoldwiz not found in game')
    return null
  }

  if (!game.winner) yowGame.winner = "draw"
  else yowGame.winner = game.winner

  const validWinnerStates = ['white', 'black', 'draw']
  if (!validWinnerStates.includes(yowGame.winner)) {
    console.error(`${yowGame.winner} is not a valid winner state`)
    return null
  }

  if (yowGame.winner === 'draw') {
    yowGame.method = getDrawType(game) 
  } else {
    yowGame.method = game.status
  }

  if (yowGame.method === 'outoftime') {
    yowGame.method = 'time'
  }

  const validMethods = [
    'mate', 'resign', 'mutual', 'stalemate', 'material', 'threefold', 
    'fiftyMove', 'time'
  ]

  if (!validMethods.includes(yowGame.method)) {
    console.error(`${yowGame.method} is not a valid method`)
    return null
  }

  return yowGame
}

function generateDrawMap(games) {
  const drawMap = {} 
  for (const game of games) {
    if (!game.winner) {
      const drawType = getDrawType(game)
      if (!drawMap[drawType]) drawMap[drawType] = 1
      else drawMap[drawType]++
    }
  }
  return drawMap
}

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


function getDrawType(game) {
  if (game.winner) return null
  const moves = game.moves.split(' ')

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

function isDevGame(game) {
  const whitePlayer = game.players.white.user 
  const blackPlayer = game.players.black.user

  if (whitePlayer.name === 'yowCapablanca' || blackPlayer.name === 'yowCapablanca') {
    return true
  }

  return false
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
