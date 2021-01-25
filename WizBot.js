const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils");


/**
 * Pick a random legal move.
 */
class WizBot {

  getNextMove(moves) {
    console.log(moves)
    const chess = new ChessUtils();
    chess.applyMoves(moves);
    const legalMoves = chess.legalMoves();
    if (legalMoves.length) {
      return chess.pickRandomMove(legalMoves);
    }
  }

  getReply(chat) {
    return "Howdy!";
  }

}

module.exports = WizBot;
