const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')


const moves =[
  'f2f4', 'd7d5', 'g1f3', 'g7g5',
  'h2h4', 'g5f4', 'e2e3', 'f4e3',
  'f1b5', 'c8d7', 'b5d7', 'b8d7',
  'a2a4', 'e3d2', 'c1d2', 'e7e6',
  'f3g5', 'g8h6', 'g5e6', 'f7e6',
  'd1h5', 'h6f7', 'h1f1', 'd8e7',
  'd2c3', 'e6e5', 'c3d2', 'h7h6',
  'h5g6', 'e7h4'
]

async function runContinously() {
  const engineMove = await engine.getMove(moves)
  setTimeout(runContinously, 5000)
}

async function runOnce() {
  const engineMove = await engine.getMove(moves)
}


async function multiRun() {
  const runs = []
  const asyncRunTimes = 1
  
  for (let i = 0; i < asyncRunTimes; i++) {
    runs.push(engine.getMove(moves))
  }
  
  const engineMoves = await Promise.all(runs) 
  console.log(engineMoves) 
}

runContinously()
// runOnce()
// multiRun()