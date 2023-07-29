require('dotenv').config()
const chessTools = require("./chessTools.js")
const chalk = require('chalk')
const engine = require('./engine')
const personalites = require('./personalities.js')
const positions = require('./testPositions.json')
const fs = require('fs').promises
const messageBus = require('./moveMessages.js')
const crypto = require('crypto')
let logData = ''

const groups = {
  'Easy': ['Joey', 'Marius', 'Sam', 'Willow', 'Risa', 'Mark'],
  'Hard': ['Orin', 'Josh7', 'Mariah', 'Ginger', "Mateo", 'Queenie'],
  'GM': ['Fischer', 'Tal', 'Karpov', 'Capablanca', 'Morphy', 'Wizard'],
}

// engine.setLogLevel('silent')
// runLoad(groups.Easy, 4000)
calibrateAllGroups()


async function calibrateAllGroups() {
  // const easyClocks = await calibrateGroup('Easy')
  const hardClocks = await calibrateGroup('Hard')
  // const gmClocks = await calibrateGroup('GM')

  // matches = 0
  // over = 0
  // under = 0 
  // desperados = 0

  // await runClock('Easy', easyClocks)
  // await runClock('Hard', hardClocks)
  // await runClock('GM', gmClocks)

}


async function runClock(groupName, clockTime) {
  const cmpNames = groups[groupName]
  for (const cmpName of cmpNames) {
    console.log(chalk.green(`............${cmpName}............`))
    await clockCrankDown(cmpName, clockTime, 0)
    console.log(
      chalk.green('totals so far:'),
      chalk.blue('matches', matches),
      chalk.red('over', over), 
      chalk.yellow('under', under), 
      chalk.magenta('desperados', desperados)
    )
  }
}


async function calibrateGroup(groupName) {
  let clockTime = await getClockTime(groupName)
  if (!clockTime) {
    let initClocktime = await getInitColckTime(groups[groupName])
    await doCalibrations(groups[groupName], groupName, initClocktime)
    clockTime = await doBestAccurateClocks(groupName)
  }
  return clockTime
}


async function getInitColckTime(cmpNames) {
   // initalize the calibration files and run the engine to the target stop ids
  // then find an average time to reach the targets for each player
  let averageTimeSum = 0
  for (const cmpName of cmpNames) {
    const averageTime = await initCalibrationFile(cmpName)
    averageTimeSum = averageTimeSum + averageTime
  }

  // attempt to create a good starting time from stopId move times
  let clockTime = (Math.round((averageTimeSum / cmpNames.length) / 50) * 50 * 40) * 1.5
  return clockTime
}


async function getClockTime(groupName) {
  // check to see if we have clocks for this group already, if so no calibration needed
  let doneClocks = await loadFile(`./calibrations/clockTimes.json`)
  if (doneClocks && doneClocks[groupName]) {
    console.log(chalk.magentaBright(`Found ${groupName} clock time: ${doneClocks[groupName]}`))
    return doneClocks[groupName]
  }
  return false
}


async function doCalibrations(cmpNames, groupName, initClockTime) {
  let clockTime = initClockTime

  // Load or any previous calibration run summaries, or create the run file
  let runSums = await loadFile(`./calibrations/runSums${groupName}.json`)
  if (!runSums) {
    console.log(chalk.green('Finding  intitial clock calibration time'))
    console.log(chalk.green('cranking down from', clockTime))
    clockTime = await clockStrategy2(cmpNames, clockTime, groupName)
   
    console.log(chalk.green(`Intitializing runSums${groupName}.json file`))
    console.log(chalk.green('Setting init clock time to', clockTime))
    runSums = runSums || { initTime: clockTime, runs : [] }
    await fs.writeFile(`./calibrations/runSums${groupName}.json`, JSON.stringify(runSums, null, 2))
  } else {
    console.log(chalk.green('previous runSums loaded'))
  }
  
  let lastRun
  if (runSums.runs.length) {
    lastRun = runSums.runs[runSums.runs.length - 1]
    clockTime = lastRun.clockTime
  } else {
    // set the clock time add 50 so we start at the actual averged time
    clockTime = runSums.initTime + 50
    console.log(chalk.green(`Starting with intial time ${runSums.initTime} from crank down`))
  }

  while(true) {
    clockTime = clockTime - 50
    const runSum = await doRuns(cmpNames, clockTime)
    console.log(chalk.magenta(runSum.idAccuracy, runSum.realAccuracy, runSum.underAccuracy))
    
    await logCalibrationSums(cmpNames, clockTime, groupName)
    
    runSums.runs.push(runSum)
    await fs.writeFile(`./calibrations/runSums${groupName}.json`, JSON.stringify(runSums, null, 2))

    // id accuracy is ver low and under accuracy is high, consider stopping
    if (runSum.idAccuracy < 80 && runSum.underAccuracy > 90) {
     
      // this should happening at the bottom of the runs, if it's not let's 
      // increase our clock time to see if we can correct
      if (runSums.runs.length < 4) {
        console.log(chalk.yellow("Low id accuracy, under 4 runs, increasing clock time"))
        clockTime = clockTime + 300
        continue
      }
     
      console.log(chalk.magentaBright('Low end and under 80, stopping runs'))
      break
    }

  }
}


// given a cmpName and a clocktime run through every test move
// return the run summary of all the moves for this personality
async function doRuns(cmpNames, clockTime, buildFile = true) {
  const runs = []
  for (const cmpName of cmpNames) {
    process.stdout.write(chalk.green(`Running ${cmpName} @ ${clockTime} `))
    const run = await buildCalibrationFile(cmpName, clockTime)
    console.log(chalk.blue(run.idAccuracy, run.realAccuracy, run.underAccuracy, run.highCount, 
      run.lowCount, run.desperados))
    runs.push(run) 
  }
  const runSum = getRunSum(runs) 
  return runSum
}


// I think the idea of this mess (since I've kind of forgotren) is to cross select
// the most accurate (by id) with the most "under accuracy" which means it's
// less strong than the original move ids
async function doBestAccurateClocks(groupName) {
    // find the best run from our pool of all runs
    let runSums = await loadFile(`./calibrations/runSums${groupName}.json`) 
    const runs = runSums.runs
    
    // get the top 4 most accurate runs
    const sortedRuns  = runs.slice().sort((run0, run1) => run0.idAccuracy - run1.idAccuracy)
    const topAccurateRuns = sortedRuns.slice(-4)

    const topAccurateByUnder = topAccurateRuns.slice().sort((run0, run1) => 
      run0.underAccuracy - run1.underAccuracy
    ) 

    const winningRun = topAccurateByUnder.slice(-1)
    const finalClockTime = winningRun[0].clockTime

    // load any previous clock times
    let clockTimes = await loadFile('./calibrations/clockTimes.json')
    if (!clockTimes) clockTimes = {}

    // add clock time to previous clock times and save
    clockTimes[groupName] = finalClockTime
    await fs.writeFile(`./calibrations/clockTimes.json`, JSON.stringify(clockTimes, null, 2))
    console.log(chalk.yellow(JSON.stringify(topAccurateByUnder, null, 2)))
    console.log(chalk.yellow('picked clockTime: ', finalClockTime))
    return finalClockTime


    // const bottomRuns = sortedRuns.slice(4)
    // const previousRun = bottomRuns.pop()
    // console.log(previousRun)

    // // include any ties for the last spot in the candidate pool
    // while(true) {
    //   const previousRun = bottomRuns.pop()
    //   if (previousRun.idAccuracy === topAccurateRuns[0].idAccuracy) {
    //      topAccurateRuns.unshift(previousRun)
    //   } else {
    //     break
    //   }
    // }
  
    // const topAccurateByUnder = topAccurateRuns.slice().sort((run0, run1) => 
    //   run0.underAccuracy - run1.underAccuracy
    // )
    // const finalClockTime = topAccurateByUnder.slice(-1).pop().clockTime

    // // runSums = { ...runSums, topAccurateRuns, topAccurateByUnder }
    // // await fs.writeFile(`./calibrations/runSums${groupName}.json`, JSON.stringify(runSums, null, 2))
    
    // let clockTimes = await loadFile('./calibrations/clockTimes.json')
    // if (!clockTimes) clockTimes = {}
    // clockTimes[groupName] = finalClockTime
    // await fs.writeFile(`./calibrations/clockTimes.json`, JSON.stringify(clockTimes, null, 2))
}


function getRunSum(runs) {
  let idAccuracySum = 0
  let realAccuracySum = 0
  let underAccuracySum = 0
  let highCount = 0
  let lowCount = 0
  let desperados = 0

  for (const run of runs) {
    idAccuracySum = idAccuracySum + run.idAccuracy
    realAccuracySum = realAccuracySum + run.realAccuracy
    underAccuracySum = underAccuracySum + run.underAccuracy
    highCount = highCount + run.highCount
    lowCount = lowCount + run.lowCount
    desperados = desperados + run.desperados
  }
  const idAccuracy = Math.round((idAccuracySum / runs.length)) 
  const realAccuracy = Math.round((realAccuracySum / runs.length)) 
  const underAccuracy = Math.round((underAccuracySum / runs.length)) 
  const clockTime = runs[0].clockTime

  return { clockTime, idAccuracy, realAccuracy, underAccuracy, highCount, lowCount, desperados }
}


async function getAccurayStats(moves, targetMoves) {
  let discrepencyCount = 0
  let highCount = 0
  let lowCount = 0
  let desperados = 0
  let realMoveAccurate = 0


  for (const i of moves.keys()) {
    const move = moves[i]
    const targetMove = targetMoves[i]

    if (targetMove.id && move.id !== targetMove.id) { 
      discrepencyCount++
    }
    if (targetMove.id && move.id > targetMove.id) {
      highCount++
    }
    if (move.id < targetMove.id) {
      lowCount++
    }
    if (move.id > targetMove.id  && move.eval < -500) {
      desperados++
    }
    // hilight if the ids don't match but they are the same move anyways
    if (targetMove.id !== move.id && targetMove.algebraMove === move.algebraMove) {
      realMoveAccurate ++ 
    }
  }

  const { averageTime } = getAverageMoveTime(moves)
  const idAccuracy = Math.round((moves.length - discrepencyCount) / moves.length * 100)
  
  const realAccuracy = 
    Math.round((moves.length - (discrepencyCount - realMoveAccurate) ) / moves.length * 100)
  
  const underAccuracy = 
    Math.round((moves.length - (discrepencyCount - lowCount) ) / moves.length * 100)
  
  return {
    averageTime,
    idAccuracy,
    realAccuracy,
    underAccuracy,
    highCount,
    lowCount,
    desperados,
  }
}


// push each personality below it's move targets and average the clock times
// seems to come out similar to strategy 1
async function clockStrategy2(cmpNames, startTime) {
  let clockTimeSum = 0
  for (const cmpName of cmpNames) {
    console.log(chalk.green(`............${cmpName}............`))
    clockTimeSum = clockTimeSum + await clockCrankDown(cmpName, startTime)
  }

  const clockTime = Math.round((clockTimeSum / cmpNames.length) / 50) * 50
  console.log('Average time is', clockTime)
  return clockTime
}


// clockCrankDown('Risa', 4000)
async function clockCrankDown(cmpName, startClockTime, decrement) {
  const calibration = await loadFile(`./calibrations/${cmpName}.json`)
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
    clockTime = await testClockTime(cmpName, position, ids[i], clockTime, decrement)
    i++
  }
  
  console.log(clockTime)
  return clockTime
}


async function doLog(...args) {
  logData = logData + args.join(' ') + '\n'
  // regEx = /\[..m/g
  // logData = logData.replace(regEx, '')
  // console.log(...args)
}


async function showLog(groupName, clockTime) {
  const log = await fs.readFile(`./calibrations/logs/${groupName}${clockTime}.txt`, 'utf8')
  console.log(log)
}


async function logCalibrationSums(cmpNames, clockTime, groupName) {
  let idAccuracySum = 0
  let realAccuracySum = 0
  let underAccuracySum = 0
  let averageTimeSum = 0
  let noDesperateAccuracySum = 0
  let topDepth = 0
  let topTargetDepth = 0
  let depthSum = 0
  let targetDepthSum = 0

  for (const cmpName of cmpNames) {
    const calibration = await loadFile(`./calibrations/${cmpName}.json`)
    const target = await loadFile(`./targets/${cmpName}.json`)

    doLog(chalk.green(`............${cmpName}............`))
    const moveStats = logMoves(calibration.moves, target.moves)
    const {averageTime, idAccuracy, realAccuracy, underAccuracy, noDesperateAccuracy } = moveStats 

    if (topDepth < moveStats.topDepth) topDepth = moveStats.topDepth
    if (topTargetDepth < moveStats.topTargetDepth) topTargetDepth = moveStats.topTargetDepth
    depthSum = depthSum + moveStats.depthSum 
    targetDepthSum = targetDepthSum + moveStats.targetDepthSum

    averageTimeSum = averageTimeSum + averageTime
    idAccuracySum = idAccuracySum + idAccuracy 
    realAccuracySum = realAccuracySum + realAccuracy
    underAccuracySum = underAccuracySum + underAccuracy
    noDesperateAccuracySum = noDesperateAccuracySum + noDesperateAccuracy

    const run = calibration.runs[calibration.runs.length - 1]
    const newRun = { ...run, idAccuracy, realAccuracy, underAccuracy }
    calibration.runs[calibration.runs.length - 1] = newRun
    // await fs.writeFile(`./calibrations/${cmpName}.json`, JSON.stringify(calibration, null, 2))
  }
  
  doLog('.........Totals...........')
  doLog(`Average time: ${ Math.round(averageTimeSum / cmpNames.length) }`)
  doLog(`ID Accuracy: ${ Math.round(idAccuracySum / cmpNames.length) }%`)
  doLog(`Real Accuracy: ${Math.round(realAccuracySum / cmpNames.length) }%`)
  doLog(`Under Accuracy: ${Math.round(underAccuracySum / cmpNames.length) }%`)
  doLog(`No Desperate: ${Math.round(noDesperateAccuracySum / cmpNames.length) }%`)
  doLog('Top Depth', topDepth)
  doLog('Top Target Depth', topTargetDepth)
  doLog('Depth Average', Math.round(depthSum / (cmpNames.length * 24)))
  doLog('Target Depth Average', Math.round(targetDepthSum / (cmpNames.length * 24)))
  doLog('Clock Time', clockTime)

  if (groupName) {
    await fs.writeFile(`./calibrations/logs/${groupName}${clockTime}.txt`, logData)
    logData = ''
  }
}


function logMoves(moves, targetMoves) {
  let discrepencyCount = 0
  let desperateCount = 0
  let realMoveAccurate = 0
  let highPoints = 0
  let lowPoints = 0
  let topDepth = 0
  let depthSum = 0
  let topTargetDepth = 0
  let targetDepthSum = 0
  

  for (const i of moves.keys()) {
    const move = moves[i]
    const targetMove = targetMoves[i]

    const depth = Math.round(move.depth / 1000)
    const targetDepth = Math.round(targetMove.depth / 1000)

    if (depth > topDepth) topDepth = depth
    depthSum = depthSum + depth

    if (targetDepth > topTargetDepth) topTargetDepth = targetDepth
    targetDepthSum = targetDepthSum + targetDepth

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

    doLog(chalk[color](
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

  doLog('Average time: ', averageTime)
  doLog('clock Estimate: ', clockTimeEstimate)
  doLog('discrpency to moves:', discrepencyCount, moves.length)
  doLog('ID Accuracy:', `${idAccuracy}%`)
  doLog(`Real Accuracy: ${realAccuracy}%`)
  doLog(`Under Accuracy: ${underAccuracy}%`)
  doLog(`With Desperate Out: ${noDesperateAccuracy}%`)
  doLog('Top Depth', topDepth)
  doLog('Top Target Depth', topTargetDepth)
  doLog('High:', highPoints)
  doLog('Low:', lowPoints)

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
    topDepth,
    depthSum,
    topTargetDepth,
    targetDepthSum,
  }
}


async function runLoad(cmpNames, clockTime) {
  console.log(chalk.green('running continous load'))
  while(true) {
    for (const cmpName of cmpNames) {
      const target = await loadFile(`./targets/${cmpName}.json`)
      // process.stdout.write(chalk.green(`Running ${cmpName} @ ${clockTime} `))
      const moves = await runPositions(cmpName, positions, clockTime)
      const accuracyStats = await getAccurayStats(moves, target.moves)
      // console.log(accuracyStats)
    }
  }
}


async function buildCalibrationFile(cmpName, clockTime) {
  let calibration = await loadFile(`./calibrations/${cmpName}.json`)
  const target = await loadFile(`./targets/${cmpName}.json`)

  // check if this clock time run has already been done
  for (const run of calibration.runs) {
    if (run.clockTime === clockTime){
      process.stdout.write(chalk.green(`: previous run found `))
      return run
    }
  }
  
  const moves = await runPositions(cmpName, positions, clockTime)
  const { movesHash, idMash } = getMovesHash(moves) 
  const { averageTime } = getAverageMoveTime(moves)
  calibration.movesHashMap[movesHash] = idMash
  const accuracyStats = await getAccurayStats(moves, target.moves)
  
  const run = { averageTime, movesHash, clockTime, ...accuracyStats }
  calibration.runs.push(run) 
  calibration.moves = moves
  

  await fs.writeFile(`./calibrations/${cmpName}.json`, JSON.stringify(calibration, null, 2))
  return run
}

// initCalibration is the first clock calibration strategy we use. We simply 
// run through all our targets positions getting stopId moves, then we average
// the reported times per move to get an initial average clock speed to work from 
// engine.setLogLevel('silent')
// initCalibrationFile('Josh7')
async function initCalibrationFile(cmpName) {
  const previousCalibration = await loadFile(`./calibrations/${cmpName}.json`)
  if (previousCalibration) {
    const averageTime = previousCalibration.runs[0].averageTime
    console.log(chalk.green(
      `Calibration for ${cmpName} already intialized: ${averageTime} ${averageTime * 40}`)
    )
    return averageTime
  }
  process.stdout.write(chalk.green(`Intializing ${cmpName}.json `))

  const moves = await getStopMoves(cmpName, positions) 
  const { movesHash, idMash } = getMovesHash(moves) 
  const { averageTime } = getAverageMoveTime(moves)
  
  const run = { averageTime, movesHash, hasStopIds: true }
  const calibration =  { cmpName, runs: [], moves, movesHashMap: {} }
  calibration.runs.push(run) 
  calibration.movesHashMap[movesHash] = idMash

  await fs.writeFile(`./calibrations/${cmpName}.json`, JSON.stringify(calibration, null, 2))
  console.log(chalk.blue(averageTime, averageTime * 40))
  return averageTime
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

async function loadFile(fileName) {
  let calibration
  try {
    const data = await fs.readFile(fileName, 'utf8')
    calibration = JSON.parse(data)
  } catch (err) {
    // console.log('Error getting calibration: ', err.code)
    return null
  }
  return calibration
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

// getStopMoves runs through a list of posistions and using a given cmp
// it assumes these positions are the same as the target moves for that cmp
// the move is returned when the stopId is hit, this is used to get an 
// estimate time that it takes to make equivalent moves on the target machine
// engine.setLogLevel('silent')
// getStopMoves('Josh7', [positions[0]])
async function getStopMoves(cmpName, positions) {
  const target = await loadFile(`./targets/${cmpName}.json`)
  const cmp = personalites.getSettings(target.cmpName)
  cmp.out.rnd = "0"
  
  let i = 0
  const moves = []

  for (const position of positions) {
    const stopId =  target.moves[i].id
    // console.log('stopId', stopId)
    const settings = { 
      moves: position.uciMoves,
      cmpName,
      gameId : 'cal', 
      stopId,
      clockTime: 60000,
      randomIsOff: true,
      shouldSkipBook: true, 
      pVals: cmp.out, 
    }
    let move = await engineGetMove(settings)
    move.gameNumber = position.gameNumber
    move.gameMoveNumber = position.moveNumber
    moves.push(move)
    i++
  }

  return moves
}


// these are used to capture counts from testClockTime, would be nice to 
// encapuslate these so they don't live in global module space
let matches = 0
let over = 0
let under = 0 
let desperados = 0

// testClocktime given a a cmpName, position, and target move id and a clock
// to wokr from it will test if the clock time hits is
// MATCH a hit, the clock time achieved the target move
// LOW this clock time came up with a move lower than the target move
// DESPERATE highter than target, but eval is so low cmp was usually desperate
// TOO HIGH this clock time looks to be to much, move was above target
// engine.setLogLevel('silent')
// testClockTime('Josh7', positions[0], 892913, 8000)
async function testClockTime(cmpName, position, targetMoveId, startClockTime, decrement) {
  if (decrement === undefined) decrement = 50
  const cmp = personalites.getSettings(cmpName)
  cmp.out.rnd = "0"

  const settings = { 
    moves: position.uciMoves, 
    cmpName,
    gameId: 'cal',
    stopId: 0, 
    clockTime: startClockTime,
    randomIsOff: true,
    shouldSkipBook: true, 
    showPreviousMoves: false, 
    pVals: cmp.out, 
  }
  
  let move
  while(true) {
    move = await engineGetMove(settings)
    if (move.id == targetMoveId) {
      console.log(chalk.blue(`${move.id} ${targetMoveId} MATCH @ ${settings.clockTime}`))
      matches++
      break
    }
    if (move.id < targetMoveId) {
      console.log(chalk.yellow(`${move.id} ${targetMoveId} LOW @ ${settings.clockTime}`))
      under++
      break
    }
    if (move.eval < -500) {
      console.log(chalk.magenta(`${move.id} ${targetMoveId} DESPERATE @ ${settings.clockTime}`))
      desperados++
      break
    }

    console.log(chalk.red(`${move.id} ${targetMoveId} TOO HIGH @ ${settings.clockTime}`))
    over++
    if (decrement === 0) break
    settings.clockTime = settings.clockTime - decrement
  } 

  return settings.clockTime
}


// runPositions takes a list of positions, and a cmpName and clockTime
// it runs through every position using the given clock time and returns all 
// the move data from that run
// engine.setLogLevel('silent')
// runPositions('Risa', positions, 4500)
async function runPositions(cmpName, positions, clockTime, target, showPreviousMoves) {
  const cmp = personalites.getSettings(cmpName)
  cmp.out.rnd = "0"

  const moves = []
  let stopId = 0
  let i = 0
  for (const position of positions) {
    const settings = { 
      moves: position.uciMoves, 
      cmpName,
      gameId: `position${i}`,
      stopId, 
      clockTime,
      randomIsOff: true,
      shouldSkipBook: true, 
      showPreviousMoves, 
      pVals: cmp.out, 
    }
    let move = await engineGetMove(settings)
    move.gameNumber = position.gameNumber
    move.gameMoveNumber = position.moveNumber
    moves.push(move)
    i++
  }
  
  return moves
}

async function engineGetMove(settings) {
  // const engineMoves = await engine.getMove(settings)
  // console.log('engineMove:', engineMoves)

  const busMove = await messageBus.getMove(settings)
  // console.log('busMove:', busMove)
  
  return busMove
}







