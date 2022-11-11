require('dotenv').config()
const chessTools = require("./chessTools.js")
const chalk = require('chalk')
const book = require('./book')
const engine = require('./engine')
const personalites = require('./personalities.js')
const positions = require('./testPositions.json')
const { moves } = require('chess-tools/opening-books/ctg/moves.js')
const fs = require('fs').promises
const crypto = require('crypto')
const chess = chessTools.create() 
const target = require('./calibrations/targets/Risa.json')
const risa = require('./calibrations/Risa.json')
// const games = require('./testgames.json')
// const risa = require('./calibrations/Risa.json')

// chess.load_pgn(positions[18].pgn)
// console.log(chess.uciMoves())

// getMove(0, 40000)
// logMoves(risa9.moves, risa10.moves)
// runCmpPositions('Risa')
// calibrateMoves()
// runCmpPositions() 
// getStopMoves(positions)
// runMultiCalibrations(1)



let badReads = 0
async function runMultiCalibrations(numberOfRuns) {
  for (let i = 0; i < numberOfRuns; i++) {
    console.log(chalk.yellow(`...............Run ${i}..............`))
    await runCalibrations(2000)
  }
  console.log('BAD READS: ', badReads)
}


// logMoves(risa.moves, target.moves)
// console.log(getMovesHash(risa.moves))
// console.log(getMovesHash(target.moves))
// getStopMoves(positions)
// calibrateEngine('Risa')
buildCalibrationFile('Risa', 2000)
// initCalibrationFile('Risa')

async function buildCalibrationFile(cmpName, clockTime) {
  let calibration = await getCalibration(`${cmpName}.json`)

  const moves = await runPositions(cmpName, positions, clockTime)
  const { movesHash, idMash } = getMovesHash(moves) 
  const { averageTime } = getAverageMoveTime(moves)
  calibration.movesHashMap[movesHash] = idMash
  
  const run = { averageTime, movesHash, clockTime }
  calibration.runs.push(run) 
  calibration.moves = moves
  
  await fs.writeFile(`./calibrations/${cmpName}.json`, JSON.stringify(calibration, null, 2))
}

async function initCalibrationFile(cmpName) {
  const target = await getCalibration(`targets/${cmpName}.json`)
  const moves = await getStopMoves(cmpName, positions) 
  const { movesHash, idMash } = getMovesHash(moves) 
  const { averageTime } = getAverageMoveTime(moves)
  
  const run = { averageTime, movesHash, hasStopIds: true }
  const calibration =  { cmpName, runs: [], moves, movesHashMap: {} }
  calibration.runs.push(run) 
  calibration.movesHashMap[movesHash] = idMash

  await fs.writeFile(`./calibrations/${cmpName}.json`, JSON.stringify(calibration, null, 2))
}

async function runCalibrations(clockTime) {
  await buildTargetFile('Risa', clockTime, null, true)
  // await buildTargetFile('Marius', clockTime)
  // await buildTargetFile('Orin', clockTime)
  // await buildTargetFile('Joey', clockTime)
  // await buildTargetFile('Willow', clockTime)
}

async function  buildTargetFile(cmpName, clockTime, fileName) {
  clockTime = clockTime || 40000
  fileName = fileName || `${cmpName}.json`
  const oldCalibration = await getCalibration(fileName)
  if (!oldCalibration) badReads++
    
  const moves = await runPositions(cmpName, positions, clockTime)
  const { movesHash } = getMovesHash(moves) 
  const { averageTime, clockTimeEstimate } = getAverageMoveTime(moves)
  
  let calibration
  if (oldCalibration) {
    calibration = oldCalibration
    calibration.runs.push({ averageTime, movesHash })
    calibration.moves = mergeMoves(oldCalibration.moves, moves) 
  } else {
    moves.forEach( (move) => {
      move.idCounts = {}
      move.idCounts[move.id] = 1
    })
    calibration = {cmpName, runs: [ { averageTime, movesHash } ], moves}   
  }
  
  await fs.writeFile(`./calibrations/${fileName}`, JSON.stringify(calibration, null, 2))
}

function mergeMoves(oldMoves, newMoves) {
  const moves = []
  newMoves.forEach( (newMove, i) => {
    let move 
    if (newMove.id > oldMoves[i].id) {
      move = newMove
      // carry over the moveIdCounts
      move.idCounts = oldMoves[i].idCounts
    } else {
      // keep the old move data since it's the top id still
      move = oldMoves[i]
    }

    // record the new moveId in the idCounts
    if ( move.idCounts[newMove.id] ) {
      move.idCounts[newMove.id] ++
    } else {
      move.idCounts[newMove.id] = 1
    }
    moves.push(move) 
  })

  return moves
}

function getMovesHash(moves) {
  let idMash = ''
  for (const move of moves) {
    idMash = idMash + move.id + ','
  }
  const movesHash = 
    crypto.createHash('md5').update(idMash.replace(',','')).digest('hex')
  
  return { movesHash, idMash }
}

async function getCalibration(fileName) {
  let calibration
  try {
    const data = await fs.readFile(`./calibrations/${fileName}`, 'utf8')
    calibration = JSON.parse(data)
  } catch (err) {
    console.log('Error getting calibration: ', err.code)
    return null
  }
  return calibration
}

async function runCmpPositions(cmpName) {
  const target = require(`./calibrations/${cmpName}2.json`)
  const results = []
  for (let clockTime = 2000; clockTime <= 2000; clockTime = clockTime + 50) {
    const moves = await runPositions(cmpName, positions, clockTime)
    const result = logMoves(moves, target.moves)
    result.clockTime = clockTime
    results.push(result)
  }

  for (const result of results) {
    console.log(result.clockTime, result.discrepencyCount, 
      result.accuracyPercent, result.lowPoints, result.hightPoints, 
      result.averageTime)
  }

}

async function getMove(positionIndex, clockTime) {
  const cmp = personalites.getSettings('Risa')
  // cmp.out.md = "9"
  cmp.out.rnd = "0"
  const index = positionIndex
  const stepNumber = 50

  const settings = { 
    moves: positions[index].uciMoves, 
    pVals: cmp.out, 
    clockTime, 
    showPreviousMoves: true,
  }

  const move = await engine.getMove(settings)
  console.log(move)
  // const move = await getVerfiedMove(settings)
  // console.log(move.time, move.id, settings.clockTime)
  // console.log(positions[index].ascii)
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

  const averageTime = Math.round(timeSum / moves.length)
  const clockTimeEstimate = Math.round(averageTime * 40)

  return { averageTime, clockTimeEstimate }
}

async function getStopMoves(cmpName, positions) {
  const target = await getCalibration(`targets/${cmpName}.json`)
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

  return moves
  // logMoves(moves, target.moves)
}

function logMoves(moves, targetMoves = []) {
  let timeSum = 0 

  let discrepencyCount = 0
  let hightPoints = 0
  let lowPoints = 0
  for (const i of moves.keys()) {
    const move = moves[i]

    let targetMoveId = ''
    if (targetMoves[i]) targetMoveId = targetMoves[i].id

    let color = 'blue'
    let discrepency = ''
    if (targetMoveId && move.id !== targetMoveId ) { 
      color = 'red'
      discrepencyCount++
    }
    if (targetMoveId && move.id > targetMoveId) {
      discrepency = 'HIGH'
      hightPoints++
    }
    if (move.id < targetMoveId) {
      discrepency = 'LOW'
      lowPoints++
    }

    console.log(chalk[color](
      String(i).padStart(2,'0'),
      String(move.time).padStart(5), 
      String(move.id).padStart(8),
      String(targetMoveId).padStart(8),
      '   ', 
      move.algebraMove.padEnd(5),
      String(move.eval).padStart(5),
      discrepency,
    ))
  }

  const { averageTime, clockTimeEstimate } = getAverageMoveTime(moves)
  const accuracyPercent = Math.round((moves.length - discrepencyCount) / moves.length * 100)

  console.log('Average time: ', averageTime)
  console.log('clock Estimate: ', clockTimeEstimate)
  console.log('discrpency to moves:', discrepencyCount, moves.length)
  console.log('Accuracy:', `${accuracyPercent}%`)
  console.log('High:', hightPoints)
  console.log('Low:', lowPoints)

  return { 
    averageTime,
    clockTimeEstimate,
    discrepencyCount,
    hightPoints,
    lowPoints, 
    accuracyPercent, 
  }
}


// runPositions('Risa', positions, 60000, targets)
async function runPositions(cmpName, positions, clockTime, target, showPreviousMoves) {
  const cmp = personalites.getSettings(cmpName)
  // const target = await getCalibration('targets/Risa.json')
  cmp.out.rnd = "0"

  const moves = []
  let stopId = 0
  let i = 0
  for (const position of positions) {
    if (target) stopId = target.moves[i].id
    const settings = { 
      moves: position.uciMoves, 
      pVals: cmp.out, 
      clockTime, 
      stopId, 
      showPreviousMoves, 
    }
    let move = await engine.getMove(settings)
    move.gameNumber = position.gameNumber
    move.gameMoveNumber = position.moveNumber
    moves.push(move)
    i++
  }
  
  return moves

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