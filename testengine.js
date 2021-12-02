const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')
// const cmp = personalites.getSettings('Marius')
const cmp = personalites.getSettings('Wizard')
// const cmp = personalites.getSettings('Capablanca')
// const cmp = personalites.getSettings('Fischer')



// console.log(cmp)
// cmp.out.rnd = 0



// Fischer vs Tal 1960
const moves = [
  'e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'f8b4', 'e4e5', 
  'c7c5', 'a2a3', 'b4a5', 'b2b4', 'c5d4', 'd1g4', 'g8e7', 
  'b4a5', 'd4c3', 'g4g7', 'h8g8', 'g7h7', 'b8c6', 'g1f3', 
  'd8c7', 'f1b5', 'c8d7', 'e1g1', 'e8c8', 'c1g5', 'c6e5', 
  'f3e5', 'd7b5', 'e5f7', 'b5f1', 'f7d8', 'g8g5', 'd8e6', 
  'g5g2', 'g1h1', 'c7e5', 'a1f1', 'e5e6', 'h1g2', 'e6g4' 
]

// // Fischer vs Tal 1960
// const moves = [
//   'e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'f8b4', 'e4e5' 
// ]


async function runThroughMoves() {
  const movesSoFar = []
  const times = []
  for (const move of moves) {
    movesSoFar.push(move) 
    times.push(await runOnce(movesSoFar))
  }
  console.log(times)
}

async function runContinously() {
  const engineMove = await engine.getMove(moves, cmp.out)
  setTimeout(runContinously, 5000)
}

async function runOnce(moves) {
  const startTime = Date.now()
  const engineMove = await engine.getMove(moves, cmp.out)
  const endTime = Date.now()
  console.log(`Elapsed time for move: ${endTime - startTime}`)
  return endTime - startTime
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
// runOnce()
// multiRun()