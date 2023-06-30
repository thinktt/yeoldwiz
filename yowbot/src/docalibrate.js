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
const { time, group } = require('console')
const { start } = require('repl')
const { load } = require('dotenv')
const chess = chessTools.create() 
let logData = ''
// const cmpEasyNames = ['Joey', 'Marius', 'Sam', 'Willow', 'Risa', 'Mark']
const cmpEasyNames = ['Joey', 'Marius', 'Sam']
const cmpHardNames = ['Orin', 'Josh7', 'Mariah', 'Ginger', "Mateo", 'Queenie']
const cmpGmNames = ['Fischer', 'Tal', 'Karpov', 'Capablanca', 'Morphy', 'Wizard']
let pipeBurst = 0
engine.setLogLevel('silent')

calibrateGroups()

async function calibrateGroups() {
  // if (clockTimeExists('Easy')) return
  let initClocktime = await getInitColckTime(cmpEasyNames)
  await doCalibrations(cmpEasyNames, 'Easy', initClocktime)
  // await doBestAccurateClocks('Easy')

  // await doCalibrations(cmpHardNames, 'Hard')
  // await doBestAccurateClocks('Hard')
  // await doCalibrations(cmpGmNames, 'Gm')
  // await doBestAccurateClocks('Gm')
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

async function clockTimeExists(groupName) {
  // check to see if we have clocks for this group already, if so no calibration needed
  let doneClocks = await loadFile(`./calibrations/clockTimes.json`)
  if (doneClocks && doneClocks[groupName]) {
    console.log(chalk.magentaBright(`Found ${groupName} clock time: ${doneClocks[groupName]}`))
    return true
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
async function doRuns(cmpNames, clockTime) {
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

// doBestUnderClocks('Easy')
async function doBestUnderClocks(groupName) {
    // find the best run from our pool of all runs
    let runSums = await loadFile(`./calibrations/runSums${groupName}.json`) 
    const runs = runSums.runs
    const sortedRuns  = runs.sort((run0, run1) => run0.underAccuracy - run1.underAccuracy)
    const topUnderRuns = sortedRuns.slice(-4)
    const bottomRuns = sortedRuns.slice(0, -4)

    // include any ties for the last spot in the candidate pool
    while(true) {
      const previousRun = bottomRuns.pop()
      if (previousRun.underAccuracy === topUnderRuns[0].underAccuracy) {
         topUnderRuns.unshift(previousRun)
      } else {
        break
      }
    }
  
    const topUnderByAccurate = topUnderRuns.slice().sort((run0, run1) => 
      run0.idAccuracy - run1.idAccuracy
    )
    const finalClockTime = topUnderByAccurate.slice(-1).pop().clockTime
    
    // runSums = { ...runSums, topUnderRuns, topUnderByAccurate }
    // await fs.writeFile(`./calibrations/runSums${groupName}.json`, JSON.stringify(runSums, null, 2))

    let clockTimes = await loadFile('./calibrations/clockTimesUnder.json')
    if (!clockTimes) clockTimes = {}
    clockTimes[groupName] = finalClockTime
    console.log(finalClockTime)
    await fs.writeFile(`./calibrations/clockTimesUnder.json`, JSON.stringify(clockTimes, null, 2)) 
}


async function buildTargets(numberOfRuns) {

  const doRuns = async (cmpNames, clockTime) => {
    for (let i=0; i < numberOfRuns; i++) {
      for (const cmpName of cmpNames) {
        console.log(chalk.green(`Starting target run for ${cmpName} at ${clockTime}`))
        const oldTarget = await loadFile(`./calibrations/${cmpName}.json`)
        if (oldTarget && oldTarget.runs.length >= numberOfRuns) { 
          console.log(chalk.green(`${cmpName}.json has reached it's run limit`))
          // remove name from the list so it doesn't get tried again
          cmpNames = cmpNames.filter(name => name !== cmpName )
          continue
        }
        await buildTargetFile(cmpName, clockTime)
        console.log(chalk.green(`Target run for ${cmpName} complete`))
      }
    }
  }
  await doRuns(cmpEasyNames, 40000)
  await doRuns(cmpHardNames, 60000)
  await doRuns(cmpGmNames, 80000)
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
  // const calibration = await loadFile(`./calibrations/${cmpName}.json`)
  // const target = await loadFile(`./targets/${cmpName}.json`)
  // const targetMoves = target.moves
  // const moves = calibration.moves

  for (const i of moves.keys()) {
    const move = moves[i]
    const targetMove = targetMoves[i]

    // const depth = Math.round(move.depth / 1000)
    // const targetDepth = Math.round(targetMove.depth / 1000)
    // if (depth > topDepth) topDepth = depth
    // depthSum = depthSum + depth
    // if (targetDepth > topTargetDepth) topTargetDepth = targetDepth
    // targetDepthSum = targetDepthSum + targetDepth

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
  
  // const noDesperateAccuracy =  Math.round(
  //   ( moves.length - (discrepencyCount - lowCount - desperados) ) / moves.length * 100
  // )

  return {
    averageTime,
    idAccuracy,
    realAccuracy,
    underAccuracy,
    highCount,
    lowCount,
    desperados,
    // noDesperateAccuracy,
    // discrepencyCount,
    // realMoveAccurate,
  }
}


async function calibrateClockTime(cmpNames, startTime, groupName) {
  startTime = startTime || 6000
  
  // place starTime first in the list, it'll be wiped if clock file already exist
  let clockTimes = [startTime]
  try {
    const data = await fs.readFile(`./calibrations/clockTimes${groupName}.json`)
    clockTimes = JSON.parse(data)
    startTime = clockTimes.slice(-1).pop() 
  } catch {}
  
  const timesToRun = 10 - clockTimes.length

  const hasRepeats = (clockTimes) => {
    if (clockTimes.length < 3) return false
    const c = clockTimes.slice(-3)
    const hasRepeats = (c[0] == c[1] && c[1] == c[2])
    return hasRepeats
  }

  console.log(chalk.green(`${clockTimes.length} clock times found`))
  console.log(chalk.green(`${timesToRun} clock runs left`))
  console.log(chalk.green(`${startTime} is current clock time`))

  for (let i = 0; i < timesToRun; i++) {
    // stop loop if we get 3 equal clock times in a row
    if (hasRepeats(clockTimes)) {
      console.log(chalk.green('four equal clockTimes of', startTime))
      break
    }

    const clockTime = await clockStrategy1(cmpNames, startTime)
    // const clockTime = await clockStrategy2(cmpNames, startTime)

    clockTimes.push(clockTime)
    await fs.writeFile(`./calibrations/clockTimes${groupName}.json`, JSON.stringify(clockTimes))
    startTime = clockTime
  }

  return startTime
}


// push  the clock down until all personalities ae below move targets
async function clockStrategy1(cmpNames, startClockTime) {
  let clockTime = startClockTime || 6000

  for (const cmpName of cmpNames) {
    console.log(chalk.green(`............${cmpName}............`))
    clockTime = await clockCrankDown(cmpName, clockTime)
  }
  console.log(clockTime)
  return clockTime
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
async function clockCrankDown(cmpName, startClockTime) {
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
    clockTime = await testClockTime(cmpName, position, ids[i], clockTime)
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
    if (move.id == targetMoveId) {
      console.log(chalk.blue(`${move.id} ${targetMoveId} MATCH @ ${settings.clockTime}`))
      break
    }
    if (move.id < targetMoveId) {
      console.log(chalk.yellow(`${move.id} ${targetMoveId} LOW @ ${settings.clockTime}`))
      break
    }
    if (move.eval < -500) {
      console.log(chalk.magenta(`${move.id} ${targetMoveId} DESPERATE @ ${settings.clockTime}`))
      break
    }

    console.log(chalk.red(`${move.id} ${targetMoveId} TOO HIGH @ ${settings.clockTime}`))
    settings.clockTime = settings.clockTime - 50
  } 

  return settings.clockTime
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

// using the target stop ids we record run[0] in a calibration file using
// the moves from this run we get average time used as start time for run[1]  
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

let badReads = 0
// buildTargetFile('Risa', 2000)
async function  buildTargetFile(cmpName, clockTime, fileName) {
  clockTime = clockTime || 40000
  fileName = fileName || `./calibrations/${cmpName}.json`
  const oldCalibration = await loadFile(`./calibrations/${fileName}`)
  if (!oldCalibration) badReads++

  const moves = await runPositions(cmpName, positions, clockTime, null, true)
  const { movesHash, idMash } = getMovesHash(moves) 
  const { averageTime } = getAverageMoveTime(moves)
  
  let calibration
  if (oldCalibration) {
    calibration = oldCalibration
    calibration.runs.push({ averageTime, movesHash, clockTime })
    calibration.moves = mergeMoves(oldCalibration.moves, moves) 
  } else {
    moves.forEach( (move) => {
      move.idCounts = {}
      move.idCounts[move.id] = 1
    })
    calibration = {cmpName, runs: [ { averageTime, movesHash, clockTime } ], moves}   
  }

  if (!calibration.movesHashMap) calibration.movesHashMap = {}
  calibration.movesHashMap[movesHash] = idMash
  
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
  const target = await loadFile(`./targets/${cmpName}.json`)
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


// runPositions('Risa', positions, 60000, targets)
async function runPositions(cmpName, positions, clockTime, target, showPreviousMoves) {
  const cmp = personalites.getSettings(cmpName)
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
    runs.push(await engineGetMove(settings))
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

async function engineGetMove(settings) {
  const moves = await engine.getMove(settings)
  return moves
  
  // let moves
  // while(pipeBurst < 10) {
  //   try {
  //     moves = await engine.getMove(settings)
  //     return moves
  //   } catch (err) {
  //     pipeBurst++
  //     console.log(chalk.bgMagenta('Pipe Burst number', pipeBurst))
  //   }
  // }
  // process.exit(1)
}