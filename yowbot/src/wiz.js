const chessTools = require("./chessTools.js")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')


async function getNextMove(moves, wizPlayer, gameId) {
      
  if (!wizPlayer) {
    console.log(`No personality selected for ${gameId}, no move made`)
    return
  }

  const cmp = personalites.getSettings(wizPlayer)

  console.log(chalk.blue(`Moving as ${cmp.name}`)) 
  console.log(chalk.blue(`Using ${cmp.book} for book moves`))


  const chess = chessTools.create()
  chess.applyMoves(moves)
  const legalMoves = chess.legalMoves()
  
  // if there are no legal moves then return
  if (!legalMoves.length) {
    return
  }

  const bookMove = await book.getHeavyMove(chess.fen(), cmp.book)
  // const bookMove = await book.getRandomMove(chess.fen())
  // const bookMove = ''

  if (bookMove != "") {
    console.log(`bookMove: ${bookMove}`)
    return {move: bookMove, willAcceptDraw: false}
  }
  
  // set different times to think to give different strength levels to easy 
  // ponder players vs hard ponder players, vs over 2700 GM players
  let clockTime = 4100 
  if (cmp.ponder === 'hard') clockTime = 5750
  if (cmp.rating >= 2700) clockTime = 8550

  const settings = { moves, pVals: cmp.out, clockTime }
  const moveData = await engine.getMove(settings)
  console.log(`engineMove: ${moveData.engineMove}`)
  return {move: moveData.engineMove, willAcceptDraw: moveData.willAcceptDraw}
}

function getReply(chat) {
  return "Howdy!"
}


module.exports = {
  getNextMove,
  getReply,
}



