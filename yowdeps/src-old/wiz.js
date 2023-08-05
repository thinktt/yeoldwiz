const chessTools = require("./chessTools.js")
const moveBus = require('./moveMessages.js')
const chalk = require('chalk')


module.exports = {
  getNextMove,
}

moveBus.init()

async function getNextMove(moves, wizPlayer, gameId) {
    
  if (!wizPlayer) {
    console.log(`No personality selected for ${gameId}, no move made`)
    return
  }

  const chess = chessTools.create()
  chess.applyMoves(moves)
  const legalMoves = chess.legalMoves()
  
  
  // if there are no legal moves then return
  if (!legalMoves.length) {
    return
  }
  
  const settings = { 
    moves, 
    cmpName: wizPlayer, 
    gameId, 
  }
  
  err = null
  const moveData = await moveBus.getMove(settings).catch(e => err = e) 
  if (err) {
    console.error(chalk.red(`error publishing move-req: ${err}`))
    return
  }
  if (!moveData) return 
  

  if (moveData.type === 'book') {
    console.log(chalk.blue(`bookMove: ${moveData.coordinateMove}`))
  } else {
    console.log(chalk.blue(`engineMove: ${moveData.coordinateMove}`))
  }

  return {move: moveData.coordinateMove, willAcceptDraw: moveData.willAcceptDraw}
}



// const book = require('./book')
// const engine = require('./engine')
// const personalites = require('./personalities.js')

// engine.setLogLevel('silent')

// let clockTimes
// try {
//   clockTimes = require('./calibrations/clockTimes.json')
//   console.log(chalk.green('clockTimes.json found, will set calibrated times'))
//   console.log(chalk.green(`Easy: ${clockTimes.Easy}    Hard: ${clockTimes.Hard}   Gm: ${clockTimes.Gm}`))
// } catch {
//   console.log(chalk.yellow('Missing ./calibrations.clockTimes.json'))
//   console.log(chalk.yellow('Plese run calibrations'))
//   console.log(chalk.yellow(`clocks will use slow defaults`))
// }

// const cmp = personalites.getSettings(wizPlayer)

// async function getNextMoveOld(moves, wizPlayer, gameId) {
      
//   if (!wizPlayer) {
//     console.log(`No personality selected for ${gameId}, no move made`)
//     return
//   }

//   const cmp = personalites.getSettings(wizPlayer)
//   // set different times to think to give different strength levels to easy 
//   // ponder players vs hard ponder players, vs over 2700 GM players
//   let clockTime
//   let secondsPerMove
//   if (clockTimes) {
//     clockTime = clockTimes.Easy
//     if (cmp.ponder === 'hard') clockTime = clockTimes.Hard
//     if (cmp.rating >= 2700) clockTime = clockTimes.Gm
//   } else {
//     secondsPerMove = 3  
//     if (cmp.ponder === 'hard') secondsPerMove = 5
//     if (cmp.rating >= 2700) secondsPerMove = 7
//   }

  
//   const chess = chessTools.create()
//   chess.applyMoves(moves)
//   const legalMoves = chess.legalMoves()
  
//   // if there are no legal moves then return
//   if (!legalMoves.length) {
//     return
//   }

//   console.log(chalk.blue(`Moving as ${cmp.name} using ${cmp.book} book and clock ${clockTime}`)) 
//   let err
//   const bookMove = await book.getHeavyMove(chess.fen(), cmp.book).catch(e => err = e)
//   if (err) {
//     console.error(chalk.red(`book error: ${err}`))
//   }

//   if (bookMove != "") {
//     console.log(chalk.blue(`bookMove: ${bookMove}`))
//     return {move: bookMove, willAcceptDraw: false}
//   }

//   const settings = { moves, pVals: cmp.out, clockTime, secondsPerMove, cmpName: cmp.name, gameId }
  
//   err = null
//   movebus.getMove(settings).catch(e => err = e) 
//   if (err) {
//     console.error(chalk.red(`error publishing move-req: ${err}`))
//   }
  
//   err = null
//   const moveData = await engine.getMove(settings).catch(e => err = e)
//   if (err) {
//     console.error(chalk.red(`unhandled engine error: ${err}`))
//     return 
//   }
//   if (!moveData) return 

//   console.log(chalk.blue(`engineMove: ${moveData.engineMove}`))
//   return {move: moveData.engineMove, willAcceptDraw: moveData.willAcceptDraw}
// }
