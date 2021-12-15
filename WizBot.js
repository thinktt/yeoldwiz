const ChessUtils = require("./ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')



class WizBot {
  constructor() {
    // this.cmp = cmp
  }

  async getNextMove(moves, wizPlayer, gameId) {
       
    if (!wizPlayer) {
      console.log(`No personality selected for ${gameId}, no move made`)
      return
    }

    const cmp = personalites.getSettings(wizPlayer)

    console.log(chalk.blue(`Moving as ${cmp.name}`)) 
    console.log(chalk.blue(`Using ${cmp.book} for book moves`))


    const chess = new ChessUtils()
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
    let secondsPerMove = 3 
    if (cmp.ponder === 'hard') secondsPerMove = 5
    if (cmp.rating >= 2700) secondsPerMove = 7

    const moveData = await engine.getMoveWithData(moves, cmp.out, secondsPerMove)
    console.log(`engineMove: ${moveData.engineMove}`)
    return {move: moveData.engineMove, willAcceptDraw: moveData.willAcceptDraw}
  }

  getReply(chat) {
    return "Howdy!"
  }

}
module.exports = WizBot



