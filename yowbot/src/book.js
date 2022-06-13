const { get } = require('http')
const ChessTools = require('../../chess-tools/index.js')
const OpeningBook = ChessTools.OpeningBooks.Polyglot
const chess = new require('chess.js').Chess()
const fs = require("fs")
const { rejects } = require('assert')


// get's any random move from the book
async function getRandomMove(fen, book) {
  const bookMoves = await getAllBookMoves(fen, book)
  if (!bookMoves) return ""
  move = bookMoves[Math.floor(Math.random() * bookMoves.length)]._algebraic_move
  return move
}

// get's random book move favoring higher weights and ignoring zero weights
async function getHeavyMove(fen, book) {
  let bookMoves = await getAllBookMoves(fen, book)
  if (!bookMoves) return ""

  // sort moves by weight for easier viewing when logging the final array
  bookMoves = bookMoves.sort((a, b) => (a._weight < b._weight) ? 1 : -1)

  // create a list of moves repeating moves by their weight
  const weightedMoves = []
  for (const move of bookMoves) {
    for (let i = 0; i < move._weight; i++) {
      weightedMoves.push(move._algebraic_move) 
    } 
  }
  
  // listBookMoves(bookMoves, fen)
  // console.log(weightedMoves)
  
  // pick a random move from the weight distributed list
  move = weightedMoves[Math.floor(Math.random() * weightedMoves.length)]
  if(!move) return ""
  return move
}

async function testMove() {
  // const move = await getAllBookMoves('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
  // const move = await getRandomBookMove('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
  const move = await getWeightFavoredBookMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  // const move = await getRandomBookMove('8/pp3p2/1k4p1/1r5p/7P/4RPK1/P7/8 b - - 0 1')
  console.log(move)
}

function listBookMoves(moves, fen) {
  chess.load(fen)
  moves = moves.sort((a, b) => (a._weight < b._weight) ? 1 : -1)
  for (const move of moves) {
    const piece = chess.get(move._algebraic_move.slice(0,2)).type
    console.log(piece, move._algebraic_move.slice(2), move._weight)
  }
}


async function getAllBookMoves(fen, bookName) {
  console.log(bookName)
  const book = new OpeningBook()
  const bookPath = process.cwd() + `/assets/books/${bookName}`
  const movePromise = new Promise((resolve) => {
    book.on("loaded", () => {
      console.log("book loaded")
      let moves = []
      try {
        moves = book.find(fen)
      } catch (err) {
        console.error('Failed to get book moves')
      }
      resolve(moves)
    }, (reject) => {
      rejects('Error from opening book')
    })
  })
  book.load_book(fs.createReadStream(bookPath))

  return movePromise
}

// testMove()

module.exports =  { getHeavyMove , getRandomMove}

// bad state test when book crashes app
// const badFen = 'r2q1rk1/pbp1p1bp/1p4pn/3pPp2/3P4/N1Q4P/PPP1NPP1/R1B1K2R w KQ f6 0 12'
// const badBook = 'Depth6.bin'
// getHeavyMove(badFen, badBook).then((moves) => {
//   console.log(moves)
// })
