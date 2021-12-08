const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')
const chessTools = require("./chess-tools")
// const cmp = personalites.getSettings('Marius')
const cmp = personalites.getSettings('Wizard')
// const cmp = personalites.getSettings('Capablanca')
// const cmp = personalites.getSettings('Fischer')



// console.log(cmp)
// cmp.out.rnd = 0



// // Fischer vs Tal 1960
// const moves = [
//   'e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'f8b4', 'e4e5', 
//   'c7c5', 'a2a3', 'b4a5', 'b2b4', 'c5d4', 'd1g4', 'g8e7', 
//   'b4a5', 'd4c3', 'g4g7', 'h8g8', 'g7h7', 'b8c6', 'g1f3', 
//   'd8c7', 'f1b5', 'c8d7', 'e1g1', 'e8c8', 'c1g5', 'c6e5', 
//   'f3e5', 'd7b5', 'e5f7', 'b5f1', 'f7d8', 'g8g5', 'd8e6', 
//   'g5g2', 'g1h1', 'c7e5', 'a1f1', 'e5e6', 'h1g2', 'e6g4'
// ] 

// const moves = [
//   'e2e4', 'e7e6', 'd2d4',
//   'd7d5', 'b1c3', 'f8b4',
//   'e4e5', 'c7c5', 'a2a3',
//   'b4a5', 'b2b4', 'c5d4',
//   'd1g4', 'g8e7', 'b4a5',
//   'd4c3', 'g4g7', 'h8g8',
//   'g7h7', 'b8c6', 'g1f3',
//   'd8c7', 'f1b5', 'c8d7'
// ]

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

const moves = [
  'd2d4', 'd7d5', 'e2e4', 'd5e4', 'c2c3', 'g8f6',
  'f1c4', 'b8d7', 'c1g5', 'h7h6', 'g5f6', 'e7f6',
  'd1e2', 'f6f5', 'b1d2', 'd8g5', 'g2g3', 'd7b6',
  'c4b3', 'f8d6', 'd2c4', 'b6c4', 'b3a4', 'c7c6',
  'a4c6', 'b7c6', 'e2c4', 'c8d7', 'd4d5', 'c6c5',
  'h2h4', 'g5f6', 'c4a6', 'e8g8', 'g1e2', 'a8b8',
  'a6a3', 'd7b5', 'g3g4', 'f5g4', 'c3c4', 'b5c4',
  'a1b1', 'e4e3', 'f2f4', 'g4f3', 'e1d1', 'b8b3',
  'd1c2', 'c4d3', 'c2b3', 'f8b8', 'b3a4', 'd3c2',
  'b2b3', 'd6c7', 'd5d6', 'f6d6', 'a3b4', 'd6a6',
  'b4a5'
]


async function runThroughMoves() {
  const movesSoFar = []
  // const times = []
  for (const move of moves) {
    movesSoFar.push(move) 
    // console.log(movesSoFar)
    await runOnce(movesSoFar)
  }
}

async function runContinously() {
  const moveData = await engine.getMoveWithData(moves, cmp.out)
  // console.log(moveData)
  moves.push(moveData.engineMove)
  const chess = new ChessUtils()
  chess.applyMoves(moveData.engineMove)
  console.log(chess.chess.ascii())
  // setTimeout(runContinously, 5000)
  runContinously()
}

async function runOnce(moves) {
  const moveData = await engine.getMoveWithData(moves, cmp.out)
  console.log(moveData)
}


async function multiRun() {
  const runs = []
  const asyncRunTimes = 1
  
  for (let i = 0; i < asyncRunTimes; i++) {
    runs.push(engine.getMove(moves, cmp.out))
  }
  
  const engineMoves = await Promise.all(runs) 
  console.log(engineMoves) 
}

runThroughMoves()
// runContinously()
// runOnce(moves)
// multiRun()