const chessTools = require("./chessTools.js")
const chalk = require('chalk')
const book = require('./book2')

const jsonStr = process.argv[2]
console.log(`Received input: ${jsonStr}`)

let input
try {
  input = JSON.parse(jsonStr)
} catch (e) {
  console.log(`Error parsing input: ${e}`)
  process.exit(1)
}

// const moves = []
// const bookName = "EarlyQueen.bin"
const moves = input.moves
const bookName = input.book

// const moves = [ 'd2d4', 'c7c5' ]
// const moves = [ 'd2d4', 'c7c5', 'c2c4', 'c5d4' ]
// const wizPlayer = 'Josh7'
// getABunchOfMoves()

getNextMove(moves, bookName)

async function getABunchOfMoves() {
  const bookMoves = {}
  for (let i = 0; i<1000; i++) {
    let bookMove = await getNextMove(moves, 'JW7', 'xyzzy')

    if (bookMove === undefined) bookMove = {move :'none'}
  
    if (!bookMoves[bookMove.move]) {
      bookMoves[bookMove.move] = 1
    } else {
      bookMoves[bookMove.move]++
    }
  
  }
  console.log(bookMoves)
}


async function getNextMove(moves, bookName) {
      
  console.log(chalk.blue(`Getting move from ${bookName}`))

  const chess = chessTools.create()
  chess.applyMoves(moves)
  const legalMoves = chess.legalMoves()
  
  // if there are no legal moves then return
  if (!legalMoves.length) {
    console.log("No legal moves")
    return null
  }

  const bookMove = await book.getHeavyMove(chess.fen(), bookName)
  if (bookMove == "") {
    console.log("no book move found")
    return null
  }

  console.log(`bookMove: ${bookMove}`)
  return {move: bookMove, willAcceptDraw: false}
}