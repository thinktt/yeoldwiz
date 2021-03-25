const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const cmps = require('./personalities.json')
const cmp = cmps['Fischer']
// const cmp = cmps['Chessmaster']


console.log(chalk.magenta('Playing as ' + cmp.name))
console.log(chalk.magenta('Using book ' + cmp.book))
// console.log(cmp.out)


class WizBot {
  constructor() {
    this.cmp = cmp
  }

  async getNextMove(moves) {
    // console.log(moves)
    const chess = new ChessUtils()
    chess.applyMoves(moves)
    const legalMoves = chess.legalMoves()
    
    // if there are no legal moves then return
    if (!legalMoves.length) {
      return
    }

    const bookMove = await book.getHeavyMove(chess.fen(), cmp.book)
    // const bookMove = await book.getRandomMove(chess.fen())
    if (bookMove != "") {
      console.log(`bookMove: ${bookMove}`)
      return bookMove
    }
    
    const engineMove = await engine.getMove(moves, cmp.out)
    console.log(`engineMove: ${engineMove}`)
    return engineMove
  }

  getReply(chat) {
    return "Howdy!"
  }

}
module.exports = WizBot
