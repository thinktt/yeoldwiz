const chessTools = require("./chessTools.js")
const book = require('./book2')

const jsonStr = process.argv[2]
// console.log(`Received input: ${jsonStr}`)

let input
try {
  input = JSON.parse(jsonStr)
} catch (e) {
  console.error(`error parsing json input: ${e}`)
  process.exit(1)
}

const moves = input.moves
const bookName = input.book

getNextMove(moves, bookName)

async function getNextMove(moves, bookName) {
  // console.log(`Getting move from ${bookName}`)

  const chess = chessTools.create()
  chess.applyMoves(moves)
  const legalMoves = chess.legalMoves()
  
  // if there are no legal moves then return
  if (!legalMoves.length) {
    console.error("no legal moves")
    process.exit(1)
  }

  let err = null 
  const bookMove = await book.getHeavyMove(chess.fen(), bookName).catch(e => err = e)
  if (err) {
    console.error(`error getting book move: ${err.message}`)
    process.exit(1)
  }

  if (bookMove == "") {
    console.error("no book move")
    process.exit(1) 
  }

  console.log(`${bookMove}`)
  process.exit(0)
}

