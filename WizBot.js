const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
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

function getWizPlayerSettings(wizPlayer) {

}
