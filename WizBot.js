const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')


class WizBot {

  async getNextMove(moves) {
    // console.log(moves)
    const chess = new ChessUtils()
    chess.applyMoves(moves)
    const legalMoves = chess.legalMoves()
    
    // if there are no legal moves then return
    if (!legalMoves.length) {
      return
    }

    const bookMove = await book.getHeavyMove(chess.fen())
    // const bookMove = await book.getRandomMove(chess.fen())
    if (bookMove != "") {
      console.log(`bookMove: ${bookMove}`)
      return bookMove
    }
    
    const engineMove = await engine.getMove(moves)
    console.log(`engineMove: ${engineMove}`)
    return engineMove
  }

  getReply(chat) {
    return "Howdy!"
  }

}
module.exports = WizBot
