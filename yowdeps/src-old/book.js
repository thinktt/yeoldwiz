const { get } = require('http')
const ChessTools = require('chess-tools')
const OpeningBook = ChessTools.OpeningBooks.Polyglot
const chess = new require('chess.js').Chess()
const fs = require("fs")
const { rejects } = require('assert')
const cmps = require('./personalities.json')
const { channel } = require('diagnostics_channel')


// load all the books when the module is loaded
// let booksAreLoaded = false
// const bookShelf = {}
// loadAllBooks()

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
  // console.log(bookName)
  const book = new OpeningBook()
  const bookPath = process.cwd() + `/books/${bookName}`
  const movePromise = new Promise((resolve, reject) => {
    book.on("loaded", () => {
      // console.log("book loaded")
      let moves = []
      try {
        moves = book.find(fen)
      } catch (err) {
        console.error(`Failed to get book moves: ${err.message}`)
      }
      resolve(moves)
    })
  })
  book.load_book(fs.createReadStream(bookPath))
  return movePromise
}

// experiment with loading all the books at once and keeping them in mem
async function getAllBookMovesExp(fen, bookName) {
  if (!booksAreLoaded) {
    console.log('still waiting for books to load')
    await whenBooksareLoaded()
  }
  const book = bookShelf[bookName] 
  const moves = book.find(fen)
  return moves
}

async function loadAllBooks() {
  console.log('Loading all opening books in the background')
  for (const name in cmps) {
    const bookName = cmps[name].book
    
    if (!bookShelf[bookName]) {
      // console.log(bookName)
      try {
        bookShelf[bookName] = await loadBook(bookName)
      } catch (err) {
        console.error(err.message)
      }
    }
  }

  // const used = process.memoryUsage().heapUsed / 1024 / 1024
  // console.log(`${Math.round(used * 100) / 100} MB`)

  booksAreLoaded = true
  console.log(`${Object.keys(bookShelf).length} books loaded`)
}

async function whenBooksareLoaded() {
  while(!booksAreLoaded) {
    await new Promise(r => setTimeout(r, 250))
  }
}

async function loadBook(bookName) {
  const book = new OpeningBook()
  const bookPath = process.cwd() + `/books/${bookName}`

  const bookPromise = new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(bookPath)
    fileStream.on('error', (err) => {
      console.log(err.message) 
      resolve(null) 
    }) 
    // resolve(fileStream)
    book.load_book(fs.createReadStream(bookPath))
    book.on("loaded", () => resolve(book))
  })

  return bookPromise
}



module.exports =  { getHeavyMove , getRandomMove}

// bad state test when book crashes app
// const badFen = 'r2q1rk1/pbp1p1bp/1p4pn/3pPp2/3P4/N1Q4P/PPP1NPP1/R1B1K2R w KQ f6 0 12'
// const badBook = 'Depth6.bin'
// getHeavyMove(badFen, badBook).then((moves) => {
//   console.log(moves)
// })
