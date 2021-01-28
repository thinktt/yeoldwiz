const ChessTools = require('./chess-tools/index.js')
const OpeningBook = ChessTools.OpeningBooks.Polyglot

async function getRandomBookMove(fen) {
  const book = new OpeningBook()
  const bookPath = process.cwd() + "/EarlyQueen.bin"
  const fs = require("fs")

  const movePromise = new Promise(resolve => {
    book.on("loaded", () => {
      console.log("book loaded")
      const entries = book.find(fen)
      let move = ""
      if (entries) {
        move = entries[Math.floor(Math.random() * entries.length)]._algebraic_move
      }
      resolve(move)
    })
  })

  book.load_book(fs.createReadStream(bookPath))

  return movePromise
}

async function testMove() {
  const move = await getAllBookMoves('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
  // const move = await getRandomBookMove('8/pp3p2/1k4p1/1r5p/7P/4RPK1/P7/8 b - - 0 1')
}

function listBookMoves(moves, fen) {
  chess.load(fen)
  moves = moves.sort((a, b) => (a._weight < b._weight) ? 1 : -1)
  for (const move of moves) {
    const piece = chess.get(move._algebraic_move.slice(0,2)).type
    console.log(piece, move._algebraic_move.slice(2), move._weight)
  }
}

async function getAllBookMoves(fen) {
  const book = new OpeningBook()
  const bookPath = process.cwd() + "/EarlyQueen.bin"
  const fs = require("fs")

  const movePromise = new Promise(resolve => {
    book.on("loaded", () => {
      console.log("book loaded")
      const moves = book.find(fen)
      resolve(moves)
    })
  })
  book.load_book(fs.createReadStream(bookPath))

  return movePromise
}

testMove()

module.exports =  { getRandomBookMove }