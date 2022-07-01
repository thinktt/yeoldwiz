require('dotenv').config()
const ChessUtils = require("./chessTools.js")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')

// Fischer vs Tal 1960
// const moves = [
//   'e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'f8b4', 'e4e5', 
//   'c7c5', 'a2a3', 'b4a5', 'b2b4', 'c5d4', 'd1g4', 'g8e7', 
//   'b4a5', 'd4c3', 'g4g7', 'h8g8', 'g7h7', 'b8c6', 'g1f3', 
//   'd8c7', 'f1b5', 'c8d7', 'e1g1', 'e8c8', 'c1g5', 'c6e5', 
//   'f3e5', 'd7b5', 'e5f7', 'b5f1', 'f7d8', 'g8g5', 'd8e6', 
//   'g5g2', 'g1h1', 'c7e5', 'a1f1', 'e5e6', 'h1g2', 'e6g4'
// ] 
// const cmp = personalites.getSettings('Marius')
// const cmp = personalites.getSettings('Wizard')
// const cmp = personalites.getSettings('Capablanca')
// const cmp = personalites.getSettings('Fischer')

const cmp = personalites.getSettings('Josh7')
const moves = ['e2e4', 'e7e6', 'd2d4']
cmp.out.rnd = 0
const moveData = runThroughMoves(cmp)


async function runThroughMoves(cmp) {

  // set different times to think to give different strength levels to easy 
  // ponder players vs hard ponder players, vs over 2700 GM players
  // let secondsPerMove = 3 
  // if (cmp.ponder === 'hard') secondsPerMove = 5
  // if (cmp.rating >= 2700) secondsPerMove = 7

  const movesSoFar = []
  const depths = []
  const times = []
  const evals = []
  const ids = []
  const algebraMoves = []
  const engineMoves = []
  const timeForMoves = []

  for (const move of moves) {
    movesSoFar.push(move) 
    const settings = { moves: movesSoFar, pVals: cmp.out, clockTime: 20000, 
      stopId : 1302341 
    }
    const moveData = await engine.getMove(settings)
    console.log(moveData)
    depths.push(moveData.depth)
    engineMoves.push(moveData.engineMove) 
    times.push(moveData.time) 
    evals.push(moveData.eval)
    ids.push(moveData.id) 
    algebraMoves.push(moveData.algebraMove)
  }

  // const averageTime = Math.round(
  //   timeForMoves.reduce((a, b) => a + b) / timeForMoves.length
  // )

  console.log(depths)
  console.log(evals)
  console.log(times)
  console.log(ids)
  console.log(engineMoves)
  console.log(algebraMoves)
  // console.log(averageTime)

  return { 
    depths,
    evals,
    times,
    engineMoves,
    timeForMoves,
    algebraMoves,
    // averageTime,
  }
}

async function runContinously() {
  const moveData = await engine.getMoveWithData({ moves, pVals: cmp.out })
  // console.log(moveData)
  moves.push(moveData.engineMove)
  const chess = new ChessUtils()
  chess.applyMoves(moveData.engineMove)
  console.log(chess.chess.ascii())
  // setTimeout(runContinously, 5000)
  runContinously()
}

async function runOnce(moves) {
  const moveData = await engine.getMoveWithData({ moves, pVals: cmp.out })
}

async function runThroughMultiple(numberOfTimes) {
  const moveStrings = []
  for (let i=0; i<numberOfTimes; i++) {
    const moveLists = await runThroughMoves()
    console.log(moveLists)
  }
  console.log(moveStrings)
}

async function multiRun() {
  const runs = []
  const asyncRunTimes = 1
  
  for (let i = 0; i < asyncRunTimes; i++) {
    const settings = { moves, pVals: cmp.out, secondsPerMove, clockTime: 40000 }
    runs.push(engine.getMove(settings))
  }
  
  const engineMoves = await Promise.all(runs) 
  console.log(engineMoves) 
}

// runThroughMoves(cmp)
// runContinously()
// runOnce(moves)
// multiRun()
// runThroughMultiple(1)

// console.log(moveData)


// async function repeatMove() { 
//   for (let i=0; i<1; i++) {
//     await engine.getMoveWithData(moves, cmp.out, 12) 
//   }
// }




// Wiz vs Capablanca (Wiz Personas)
// const moves = [
//   'e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'b2b4',
//   'c5b4', 'c2c3', 'b4a5', 'e1g1', 'g8f6', 'd2d4', 'e5d4',
//   'c1a3', 'd7d6', 'e4e5', 'd6e5', 'd1b3', 'd8d7', 'f1e1',
//   'e5e4', 'f3g5', 'c6e5', 'g5e4', 'e8d8', 'e4c5', 'd7f5',
//   'c4f7', 'a8b8', 'c5e6', 'c8e6', 'f7e6', 'f5h5', 'f2f4',
//   'e5c6', 'e6f7', 'h5g4', 'g2g3', 'h7h5', 'f7e6', 'g4f3',
//   'e6h3', 'f6g4', 'e1f1', 'f3e2', 'h3g2', 'd8c8', 'b3f7',
//   'b8a8', 'f7g7', 'h8d8', 'a3c1', 'd4c3', 'b1c3', 'a5b6',
//   'g1h1', 'g4f2', 'h1g1', 'f2e4', 'g1h1', 'e4c3', 'a2a4',
//   'c3d1', 'a1b1', 'e2c2', 'b1b2', 'c2c1', 'b2e2', 'c1c4',
//   'g2f3', 'c4d3', 'g7f7', 'c6d4', 'f7h5', 'd1e3', 'h5h3',
//   'c8b8', 'e2e3', 'd3e3', 'f3g2', 'e3e8', 'f4f5', 'd4c2',
//   'g3g4', 'c2e3', 'h3f3', 'c7c6', 'f1b1', 'e8e5', 'f3e4',
//   'e5d6', 'e4f3', 'b6c7', 'f3h3', 'e3d1', 'h3h4', 'd8e8',
//   'g2f1', 'd6f4'
// ]

// const moves = [
//   'd2d4', 'd7d5', 'e2e4', 'd5e4', 'c2c3', 'g8f6',
//   'f1c4', 'b8d7', 'c1g5', 'h7h6', 'g5f6', 'e7f6',
//   'd1e2', 'f6f5', 'b1d2', 'd8g5', 'g2g3', 'd7b6',
//   'c4b3', 'f8d6', 'd2c4', 'b6c4', 'b3a4', 'c7c6',
//   'a4c6', 'b7c6', 'e2c4', 'c8d7', 'd4d5', 'c6c5',
//   'h2h4', 'g5f6', 'c4a6', 'e8g8', 'g1e2', 'a8b8',
//   'a6a3', 'd7b5', 'g3g4', 'f5g4', 'c3c4', 'b5c4',
//   'a1b1', 'e4e3', 'f2f4', 'g4f3', 'e1d1', 'b8b3',
//   'd1c2', 'c4d3', 'c2b3', 'f8b8', 'b3a4', 'd3c2',
//   'b2b3', 'd6c7', 'd5d6', 'f6d6', 'a3b4', 'd6a6',
//   'b4a5'
// ]

// const moves = [
// 'e2e4','e7e5','g1f3','b8c6','f1b5','a7a6','b5a4','g8f6','e1g1','f8e7','f1e1','b7b5','a4b3','d7d6','c2c3','c6a5','b3c2','c7c5','d2d4','d8c7','d4d5','e8g8','b2b3','c8g4','h2h3','g4h5','c1e3','a5b7','c3c4','f8b8','b1d2','h7h6','d2f1','h5g6','f1g3','g6h7','d1e2','b7a5','e3d2','e7f8','g3f5','g8h8','g2g4','a8a7','g1h1','b5c4','b3c4','a7a8','e1b1','b8e8','b1g1','f6d7','g4g5','h6h5','g5g6','h7g6','f5h4','g6h7','f3g5','d7f6','d2c3','a5b7','f2f4','g7g6','f4f5','f8h6','g5h7','h8h7','f5g6','f7g6','g1g6','c7f7','a1f1','f7g6','h4g6','h7g6','c3e1','e8f8','e1h4','b7a5','f1f5','h6g7','h4f6','g7f6','c2d1','g6f7','e2d2','a5c4','d2c1','f7e7','c1c4','h5h4','c4f1','f8f7','a2a4','f7f8','a4a5','f8f7','d1h5','f7f8','h5e2','a8b8','e2a6','b8b3','a6e2','f8f7','a5a6','f7f8','a6a7','b3a3','f5f3','a3a7','f1b1','f8a8','f3f1','f6g5','b1b2','g5h6','f1g1','h6e3','g1g7','e7f6','g7a7','a8a7','b2b6','a7a1','h1g2','a1g1','g2h2','f6f7','b6d8','g1b1','d8d6','b1b2','d6e6','f7f8','h2g2','b2e2','g2f1','e2f2','f1e1','f2g2','e6e5','e3d4','e5f4','f8e8','f4h4','e8d7','e4e5','g2g1','e1e2','d4e5','h4h5','e5d4','h5f5','d7c7','f5f4','c7d7','f4f7','d7d8','h3h4','g1g2','e2d3','g2f2','f7g8','d8c7','g8g3','c7d7','g3h3','d7c7','h4h5','f2f6','h5h6','f6b6','h3h2','c7b7','h6h7','b6b3','d3e4','b3e3','e4f4','e3e8','f4f5','e8c8','f5e6','c8d8','d5d6','b7b6','e6e7','d8a8','d6d7','b6b5','d7d8q','a8d8','e7d8','c5c4','h2b8','b5c5','b8c7','c5b4','c7h2'
// ]