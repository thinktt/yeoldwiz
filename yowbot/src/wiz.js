const chessTools = require("./chessTools.js")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')

engine.setLogLevel('quiet')

let clockTimes
try {
  clockTimes = require('./calibrations/clockTimes.json')
  console.log(chalk.green('clockTimes.json found, will set calibrated times'))
  console.log(chalk.green(`Easy: ${clockTimes.Easy}    Hard: ${clockTimes.Hard}   Gm: ${clockTimes.Gm}`))
} catch {
  console.log(chalk.yellow('Missing ./calibrations.clockTimes.json'))
  console.log(chalk.yellow('Plese run calibrations'))
  console.log(chalk.yellow(`clocks will use slow defaults`))
}


async function getNextMove(moves, wizPlayer, gameId) {
      
  if (!wizPlayer) {
    console.log(`No personality selected for ${gameId}, no move made`)
    return
  }

  const cmp = personalites.getSettings(wizPlayer)

  
  const chess = chessTools.create()
  chess.applyMoves(moves)
  const legalMoves = chess.legalMoves()
  
  // if there are no legal moves then return
  if (!legalMoves.length) {
    return
  }

  console.log(chalk.blue(`Moving as ${cmp.name} using ${cmp.book} book`)) 
  const bookMove = await book.getHeavyMove(chess.fen(), cmp.book)
  // const bookMove = await book.getRandomMove(chess.fen())
  // const bookMove = ''

  if (bookMove != "") {
    console.log(`bookMove: ${bookMove}`)
    return {move: bookMove, willAcceptDraw: false}
  }

  // set different times to think to give different strength levels to easy 
  // ponder players vs hard ponder players, vs over 2700 GM players
  let clockTime
  let secondsPerMove
  if (clockTimes) {
    clockTime = clockTimes.Easy
    if (cmp.ponder === 'hard') clockTime = clockTimes.Hard
    if (cmp.rating >= 2700) clockTime = clockTimes.Gm
  } else {
    secondsPerMove = 3  
    if (cmp.ponder === 'hard') secondsPerMove = 5
    if (cmp.rating >= 2700) secondsPerMove = 7
  }
  


  const settings = { moves, pVals: cmp.out, clockTime, secondsPerMove }
  const moveData = await engine.getMove(settings)
  if (!moveData) return

  console.log(chalk.magenta(`engineMove: ${moveData.engineMove}`))
  return {move: moveData.engineMove, willAcceptDraw: moveData.willAcceptDraw}
}

function getReply(chat) {
  return "Howdy!"
}


module.exports = {
  getNextMove,
  getReply,
}



