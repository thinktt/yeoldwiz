require('dotenv').config()
const chessTools = require("./chessTools.js")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')
// const games = require('./testgames.json')
const positions = require('./testPositions.json')
const fs = require('fs')
const chess = chessTools.create() 
const risa = require('./calibrations/Risa2.json')
const target = require('./calibrations/Risa.json')


logMoves(risa.moves, target.moves )
// runCmpPositions()
// calibrateMoves()
// runCmpPositions() 


// getMove()
async function getMove() {
  const cmp = personalites.getSettings('Risa')
  cmp.out.rnd = "0"
  cmp.out.md = "11"
  const index = 2
  let clockTime = 90000
  const stepNumber = 50

  const settings = { 
    moves: positions[index].uciMoves, 
    pVals: cmp.out, 
    clockTime, 
  }

  const move = await getVerfiedMove(settings)
  console.log(move.time, move.id, target.moves[index].id, settings.clockTime)
  return
  
  while(true) {
    const move = await getVerfiedMove(settings)
    console.log(move.time, move.id, target.moves[index].id, settings.clockTime)
    if (move.id === target.moves[index].id) {
      console.log('EQUAL')
      break
    } else if (move.id < target.moves[index].id) {
      console.log('LOW')
      settings.clockTime = settings.clockTime + stepNumber
    } else {
      console.log('HIGH')
      break
      // settings.clockTime = settings.clockTime - stepNumber
    } 
  }

}


function getAverageMoveTime(moves) {
  let timeSum = 0
  for (const move of moves) {
    timeSum = timeSum + move.time
  }
  const averageTime = timeSum / moves.length
  const clockTimeEstimate =  averageTime * 40
  return { averageTime, clockTimeEstimate }
}

async function getStopMoves(target, positions) {
  const cmp = personalites.getSettings(target.cmpName)
  cmp.out.rnd = "0"
  
  let i = 0
  const moves = []

  for (const position of positions) {
    const settings = { 
      moves: position.uciMoves, 
      pVals: cmp.out, 
      clockTime: 60000, 
      stopId: target.moves[i].id 
    }
    let move = await engine.getMove(settings)
    move.gameNumber = position.gameNumber
    move.gameMoveNumber = position.moveNumber
    moves.push(move)
    i++
  }

  logMoves(moves)
}

function logMoves(moves, targetMoves = []) {
  let timeSum = 0 

  for (const i of moves.keys()) {
    const move = moves[i]
    timeSum = timeSum + move.time

    let targetMoveId = ''
    if (targetMoves[i]) {
      targetMoveId = targetMoves[i].id
    }

    console.log(
      String(i).padStart(2,'0'),
      String(move.time).padStart(5), 
      String(move.id).padStart(8),
      String(targetMoveId).padStart(8),
      '   ', 
      move.algebraMove.padEnd(5),
      String(move.eval).padStart(5),
    )
  }
  const averageTime = timeSum / moves.length
  const clockTimeEstimate = Math.round(averageTime * 40)

  console.log('Average time: ', averageTime)
  console.log('clock Estimate: ', clockTimeEstimate)
}

async function runCmpPositions() {
  await runPositions('Risa', positions, 40000) // 8570
  await runPositions('Willow', positions, 40000)
  await runPositions('Marius', positions, 40000)
  await runPositions('Joey', positions, 40000)
}

async function runPositions(cmpName, positions, clockTime) {
  const cmp = personalites.getSettings(cmpName)
  cmp.out.rnd = "0"

  const moves = []
  for (const position of positions) {
    const settings = { moves: position.uciMoves, pVals: cmp.out, clockTime, stopId: 0 }
    // let move = await getVerfiedMove(settings)
    let move = await engine.getMove(settings)
    move.gameNumber = position.gameNumber
    move.gameMoveNumber = position.moveNumber
    moves.push(move)
  }

  // console.log(moves)
  console.log('....................')
  let timeSum = 0 
  for (const move of moves) {
    timeSum = timeSum + move.time
    console.log(`${move.time} ${move.id} ${move.algebraMove} ${move.eval} ` + 
     `${move.gameNumber}:${move.gameMoveNumber}`)
  }
  const averageTime = timeSum / moves.length
  const clockTimeEstimate = (averageTime * 40)

  console.log('Average time: ', averageTime)
  console.log('clock Estimate: ', clockTimeEstimate)

  const calibration = { cmpName, averageTime, clockTimeEstimate, moves }
  // return calibration
  fs.writeFileSync(`./calibrations/${cmp.name}2.json`, JSON.stringify(calibration, null, 2))

}

// run the moves twice just to try and eliminate anomalies where the engine
// outputs a different move on occassion, keep going until we move ids match
async function getVerfiedMove(settings) {
    let move = {id: "0"}
    while(true) {
      const verifyMove = await engine.getMove(settings)
      if (move.id == verifyMove.id) {
        console.log('Move verfied')
        break
      }
      move = verifyMove
    } 
  return move
}

async function runSinglePosisiton() {
  console.log((positions[9].uciMoves).slice().push(positions[9].nextMove))
  const settings = { moves: positions[9].uciMoves, pVals: cmp.out, clockTime: 40000, stopId: 0 }
  move = await engine.getMove(settings)
}

function buildTestPostionFile() {
  const positions = []
  let i = 0
  for (const game of games) {
    const position = getRandoPosition([game])
    position.gameNumber = i
    positions.push(position)
    i++
  }
  fs.writeFileSync('./testPositions.json', JSON.stringify(positions, null, 2))
}


// takes a list of uci style games (list of moves) and createa a random uci 
// positon from somwhere in all the games
function getRandoPosition(games) {
  
  // pick a random game
  const gameNumber = Math.floor(Math.random() * games.length)
  const game = games[gameNumber]
  
  const originalGame = chessTools.create()
  originalGame.load_pgn(game.pgn)
  
  // pick a random move
  const uciMoves = originalGame.uciMoves()
  const moveNumber = Math.floor(Math.random() * uciMoves.length)


  
  const position = chessTools.create()
  for (let i = 0; i < moveNumber; i++)  {
    const from = uciMoves[i].slice(0,2)
    const to = uciMoves[i].slice(2)
    position.move({ from, to })
  }

  return {
    title:  game.title, 
    url: game.url,
    moveNumber: position.moveNumber(),
    gameNumber, 
    turn: position.turn(),
    uciMoveNumber : moveNumber,
    pgn: position.pgn({ max_width: 80 }),
    uciMoves: position.uciMoves(),
    ascii: position.ascii(),
    nextMove: originalGame.uciMoves()[moveNumber],
  } 
  
}

async function repeatMove(cmp, movesSoFar, timesToRepeat) {
  console.log(movesSoFar)
  const settings = { moves: movesSoFar, pVals: cmp.out, clockTime: 20000, stopId: 0 }
  const moves = []
  for (let i = 0; i < timesToRepeat; i++) {
    moves[i] = await engine.getMove(settings)
  }

  for (const move of moves) {
    console.log(`${move.time} ${move.id} ${move.algebraMove} ${move.eval}`)
  }
}


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

// expandPositions(positions)
async function expandPositions(positions) {
  const newPositions = []

  for (position of positions) {
    position.moveNumber = position.moveNumber + .5
    const nextMove = position.nextMove
    delete position.nextMove
    newPositions.push(position)   
    
    // create the next positions from position.nextMove
    const chess = chessTools.create() 
    const game = chess.load_pgn(position.pgn)
    const to = nextMove.slice(2)
    const from = nextMove.slice(0,2)
    chess.move({from, to})
    const nextPosition = {
        title:  position.title, 
        url: position.url,
        moveNumber: position.moveNumber + .5,
        gameNumber: position.gameNumber, 
        turn: chess.turn(),
        uciMoveNumber : chess.uciMoves().length,
        pgn: chess.pgn({ max_width: 80 }),
        uciMoves: chess.uciMoves(),
        ascii: chess.ascii(),
    }
    newPositions.push(nextPosition)
  }
  
  console.log(newPositions.length)
  // fs.writeFileSync('./positions.json', JSON.stringify(newPositions, null, 2))
  // return newPositions
}