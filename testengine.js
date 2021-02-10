const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')


const moves = [
  'e2e4', 'd7d5', 'd2d3', 'e7e6', 'b1c3', 'f8b4',
  'c1d2', 'b4c3', 'd2c3', 'g8f6', 'e4e5', 'd5d4',
  'c3b4', 'f6d5', 'b4a3', 'c7c5', 'c2c4', 'd8a5',
  'd1d2', 'a5d2', 'e1d2', 'd5b6', 'a3c5', 'b6a4',
  'b2b4', 'a7a5'
]

async function multiRun() {
  const runs = []
  const asyncRunTimes = 30
  
  for (let i = 0; i < asyncRunTimes; i++) {
    runs.push(engine.getMove(moves))
  }
  
  const engineMoves = await Promise.all(runs) 
  console.log(engineMoves) 
}

multiRun()