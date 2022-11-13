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
const { time } = require('console')
const { start } = require('repl')
const chess = chessTools.create() 

doCalibrations()
async function doCalibrations() {
  const cmpNames = ['Joey', 'Marius', 'Orin', 'Willow', 'Risa']
  let averageTimeSum = 0
  for (const cmpName of cmpNames) {
    const averageTime = await initCalibrationFile(cmpName)
    averageTimeSum = averageTimeSum + averageTime
  }

  let clockTime = Math.round((averageTimeSum / cmpNames.length) / 50) * 50 * 40

  clockTime = await multiRunCrankDown(cmpNames, clockTime) 

  for (const cmpName of cmpNames) {
    await buildCalibrationFile(cmpName, clockTime)
  }

  logCalibrationSums(cmpNames)
  console.log(chalk.red('Pipe Burst: ', pipeBurst))

}

async function multiRunCrankDown(cmpNames, startTime) {
  startTime = startTime || 6000
  let clockTimes = []
  try {
    const data = await fs.readFile('./calibrations/clockTimes.json')
    clockTimes = JSON.parse(data)
    startTime = clockTimes.slice(-1).pop() 
  } catch {}
  const timesToRun = 10 - clockTimes.length
  
  const hasRepeats = (clockTimes) => {
    if (clockTimes.length < 4) return false
    const c = clockTimes.slice(-4)
    const hasRepeats = (c[0] == c[1] && c[1] == c[2] && c[2] == c[3])
    return hasRepeats
  }

  console.log(chalk.green(`${clockTimes.length} clock times found`))
  console.log(chalk.green(`${timesToRun} clock runs left`))
  console.log(chalk.green(`${startTime} is current clock time`))

  for (let i = 0; i < timesToRun; i++) {
    // stop loop if we get three equal clock times in a row
    if (hasRepeats(clockTimes)) {
      console.log(chalk.green('three equal clockTimes of', startTime))
      break
    }

    const clockTime = await longClockCrankDown(cmpNames, startTime)
    clockTimes.push(clockTime)
    await fs.writeFile(`./calibrations/clockTimes.json`, JSON.stringify(clockTimes))
    startTime = clockTime
  }

  return startTime
}

// longClockCrankDown()
async function longClockCrankDown(cmpNames, startClockTime) {
  let clockTime = startClockTime || 6000

  for (const cmpName of cmpNames) {
    console.log(chalk.green(`............${cmpName}............`))
    clockTime = await clockCrankDown(cmpName, clockTime)
  }
  console.log(clockTime)
  return clockTime
}

// doCalibrationRuns(3750)
async function doCalibrationRuns(clockTime) {
  const cmpNames = ['Joey', 'Marius', 'Orin', 'Risa', 'Willow']
  clockTime = clockTime || 6000

  for (const cmpName of cmpNames) {
    console.log(chalk.green(`............${cmpName}............`))
    await buildCalibrationFile(cmpName, clockTime)
  }
  console.log(clockTime)
  return clockTime

}


async function logCalibrationSums(cmpNames) {
  // const cmpNames = ['Joey', 'Marius', 'Orin', 'Risa', 'Willow']
  let idAccuracySum = 0
  let realAcccuracySum = 0
  let underAccuracySum = 0
  let averageTimeSum = 0
  let noDesperateAccuracySum = 0

  for (const cmpName of cmpNames) {
    const calibration = await loadCalibrationFile(`${cmpName}.json`)
    const target = await loadCalibrationFile(`targets/${cmpName}.json`)

    console.log(chalk.green(`............${cmpName}............`))
    const moveStats = logMoves(calibration.moves, target.moves)
    const {averageTime, idAccuracy, realAccuracy, underAccuracy, noDesperateAccuracy} = moveStats 
    averageTimeSum = averageTimeSum + averageTime
    idAccuracySum = idAccuracySum + idAccuracy 
    realAcccuracySum = realAcccuracySum + realAccuracy
    underAccuracySum = underAccuracySum + underAccuracy
    noDesperateAccuracySum = noDesperateAccuracySum + noDesperateAccuracy
  }
  
  console.log('.........Totals...........')
  console.log('Average time: ', averageTimeSum / cmpNames.length )
  console.log('ID Accuracy:', `${idAccuracySum / cmpNames.length}%`)
  console.log(`Real Accuracy: ${realAcccuracySum / cmpNames.length}%`)
  console.log(`Under Accuracy: ${underAccuracySum / cmpNames.length}%`)
  console.log(`No Desperate: ${noDesperateAccuracySum / cmpNames.length}%`)

}

// clockCrankDown('Joey', 6000)
async function clockCrankDown(cmpName, startClockTime) {
  const calibration = await loadCalibrationFile(`${cmpName}.json`)
  if (!calibration) {
    console.log('Error loading calibration')
    return
  }
  const idMash = calibration.movesHashMap[calibration.runs[0].movesHash]
  const ids = idMash.split(',').slice(0,-1)

  const position = positions[0]
  let clockTime = startClockTime
  
  let i = 0
  for (const position of positions) {
    clockTime = await testClockTime(cmpName, position, ids[i], clockTime)
    i++
  }
  
  // console.log(clockTime)
  return clockTime
}

async function testClockTime(cmpName, position, targetMoveId, startClockTime) {
  const cmp = personalites.getSettings(cmpName)
  cmp.out.rnd = "0"

  const settings = { 
    moves: position.uciMoves, 
    pVals: cmp.out, 
    clockTime: startClockTime, 
    stopId: 0, 
    showPreviousMoves: false, 
  }
  
  let move
  while(true) {
    move = await engineGetMove(settings)
    if (move.id <= targetMoveId || move.eval < -500) break
    console.log(chalk.green('TOO HIGH'))
    settings.clockTime = settings.clockTime - 50
  } 

  return settings.clockTime
}

let badReads = 0
async function runMultiCalibrations(numberOfRuns) {
  for (let i = 0; i < numberOfRuns; i++) {
    console.log(chalk.yellow(`...............Run ${i}..............`))
    await runCalibrations(2000)
  }
  console.log('BAD READS: ', badReads)
}

async function initMultipleCalibrations() {
  const cmpNames = ['Joey', 'Marius', 'Orin', 'Willow']
  for (const cmpName of cmpNames) {
    await initCalibrationFile(cmpName)
  }
}

async function buildCalibrationFile(cmpName, clockTime) {
  let calibration = await loadCalibrationFile(`${cmpName}.json`)

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
  const previousCalibration = await loadCalibrationFile(`${cmpName}.json`)
  if (previousCalibration) {
    console.log(chalk.green(`Calibration for ${cmpName} already intialized`))
    return previousCalibration.runs[0].averageTime
  }

  const moves = await getStopMoves(cmpName, positions) 
  const { movesHash, idMash } = getMovesHash(moves) 
  const { averageTime } = getAverageMoveTime(moves)
  
  const run = { averageTime, movesHash, hasStopIds: true }
  const calibration =  { cmpName, runs: [], moves, movesHashMap: {} }
  calibration.runs.push(run) 
  calibration.movesHashMap[movesHash] = idMash

  await fs.writeFile(`./calibrations/${cmpName}.json`, JSON.stringify(calibration, null, 2))
  return averageTime
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
  const oldCalibration = await loadCalibrationFile(fileName)
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

async function loadCalibrationFile(fileName) {
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
      result.idAccuracy, result.lowPoints, result.highPoints, 
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

  const move = await engineGetMove(settings)
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
  const target = await loadCalibrationFile(`targets/${cmpName}.json`)
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
    let move = await engineGetMove(settings)
    move.gameNumber = position.gameNumber
    move.gameMoveNumber = position.moveNumber
    moves.push(move)
    i++
  }

  return moves
  // logMoves(moves, target.moves)
}

function logMoves(moves, targetMoves) {
  let discrepencyCount = 0
  let desperateCount = 0
  let realMoveAccurate = 0
  let highPoints = 0
  let lowPoints = 0

  for (const i of moves.keys()) {
    const move = moves[i]
    const targetMove = targetMoves[i]

    let color = 'blue'
    let discrepency = ''
    if (targetMove.id && move.id !== targetMove.id) { 
      color = 'red'
      discrepencyCount++
    }
    if (targetMove.id && move.id > targetMove.id) {
      discrepency = 'HIGH'
      highPoints++
    }
    if (move.id < targetMove.id) {
      discrepency = 'LOW'
      lowPoints++
    }

    if (move.id > targetMove.id  && move.eval < -500) {
      desperateCount++
    }

    
    // hilight if the ids don't match but they are the same move anyways
    if (targetMove.id !== move.id && targetMove.algebraMove === move.algebraMove) {
      color = 'yellow'
      realMoveAccurate ++ 
    }

    
    // highlight low moves that are also alt moves in the target file
    if (discrepency && targetMove.idCounts[move.id]) {
      color = 'magenta'
    }

    console.log(chalk[color](
      String(i).padStart(2,'0'),
      String(move.time).padStart(5), 
      String(move.id).padStart(8),
      String(targetMove.id).padStart(8),
      '   ', 
      move.algebraMove.padEnd(5),
      targetMove.algebraMove.padEnd(5),
      String(move.eval).padStart(5),
      String(targetMove.eval).padStart(5),
      String(move.depth).padStart(5),
      String(targetMove.depth).padStart(5),
      discrepency,
    ))
  }

  const { averageTime, clockTimeEstimate } = getAverageMoveTime(moves)
  const idAccuracy = Math.round((moves.length - discrepencyCount) / moves.length * 100)
  const realAccuracy = 
    Math.round((moves.length - (discrepencyCount - realMoveAccurate) ) / moves.length * 100)
  const underAccuracy = 
    Math.round((moves.length - (discrepencyCount - lowPoints) ) / moves.length * 100)
  const noDesperateAccuracy =  Math.round(
      (moves.length - (discrepencyCount - lowPoints - desperateCount) ) / moves.length * 100
    )

  console.log('Average time: ', averageTime)
  console.log('clock Estimate: ', clockTimeEstimate)
  console.log('discrpency to moves:', discrepencyCount, moves.length)
  console.log('ID Accuracy:', `${idAccuracy}%`)
  console.log(`Real Accuracy: ${realAccuracy}%`)
  console.log(`Under Accuracy: ${underAccuracy}%`)
  console.log(`With Desperate Out: ${noDesperateAccuracy}%`)
  console.log('High:', highPoints)
  console.log('Low:', lowPoints)

  return { 
    averageTime,
    clockTimeEstimate,
    discrepencyCount,
    highPoints,
    lowPoints, 
    idAccuracy, 
    realAccuracy,
    underAccuracy,
    noDesperateAccuracy,
  }
}


// runPositions('Risa', positions, 60000, targets)
async function runPositions(cmpName, positions, clockTime, target, showPreviousMoves) {
  const cmp = personalites.getSettings(cmpName)
  // const target = await loadCalibrationFile('targets/Risa.json')
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
    let move = await engineGetMove(settings)
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
      const verifyMove = await engineGetMove(settings)
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
  move = await engineGetMove(settings)
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
    moves[i] = await engineGetMove(settings)
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
    const moveData = await engineGetMove(settings)
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
  const moveData = await engineGetMoveWithData({ moves, pVals: cmp.out })
  // console.log(moveData)
  moves.push(moveData.engineMove)
  const chess = new ChessUtils()
  chess.applyMoves(moveData.engineMove)
  console.log(chess.chess.ascii())
  // setTimeout(runContinously, 5000)
  runContinously()
}

async function runOnce(moves) {
  const moveData = await engineGetMoveWithData({ moves, pVals: cmp.out })
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
    runs.push(engineGetMove(settings))
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

let pipeBurst = 0
async function engineGetMove(settings) {
  let moves
  while(pipeBurst < 10) {
    try {
      moves = await engine.getMove(settings)
    } catch (err) {
      pipeBurst++
      console.log(chalk.red('Pipe Burst number', pipeBurst))
    }
    return moves
  }
}