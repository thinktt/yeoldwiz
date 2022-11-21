const chessTools = require("./chessTools.js")
const { exec } = require('child_process')
const chalk = require('chalk')
const { moves } = require('chess-tools/opening-books/ctg/moves')

const defaultSettings = {
  moves: [],
  pVals: { 
    "opp": "125", "opn": "104", "opb": "104", "opr": "104", "opq": "104", 
    "myp": "125", "myn": "104", "myb": "104", "myr": "104", "myq": "104", 
    "mycc": "96", "mymob": "96", "myks": "120", "mypp": "96", "mypw": "125", 
    "opcc": "96", "opmob": "96", "opks": "120", "oppp": "96", "oppw": "125", 
    "cfd": "250", "sop": "100", "avd": "30", "rnd": "0", "sel": "9", "md": "99", 
    "tts": "16777216"
  },
  secondsPerMove: null,
  clockTime: null,
  stopId: null,
}
let logLevel = 'verbose'
let console2 = console



// Start the engine and get next move using given engine settings
async function getMove(settings) {
  settings = fillDefaultSettings(settings)
  if (settings.pVals.rnd === 0) console2.log('random moves are off')
  // moves, pVals, secondsPerMove, clockTime

  // start the chess engine process, using the proper engine command
  // defaults is ./enginewrap and will work in WSL 
  // Dockerfile sets ENG_CMD /usr/bin/wine ./enginewrap
  const cmd = process.env.ENG_CMD ||  './enginewrap'
  console2.log(`engine cmd: ${cmd}`)
  const child = exec(cmd)
  let moveData
  let previousMoves = []
 
  // on close event stop the process
  child.on('close', (code) => {
      console2.log(`engine exited with ${code}`)
  })


  // create a movePromise, when engine responds with a move it resolves and
  // sends an exit command to the engine, closing the process
  let startTime
  let quitWasSent = false  
  const movePromise = new Promise(resolve => {
    child.stdout.on('data', (data) => {
      const engineLines = data.toString().replace('\r','\n').split('\n')
      for (let engineLine of engineLines) {
       
        // ignore empty lines, add return char back to end of line
        if (engineLine === '') continue
        engineLine = engineLine + '\n'

        // if egineline starts with an int this is a move line, parse it and
        // store it in the moveData object
        if (parseInt(engineLine) > 1000) {
          log(chalk.yellow(engineLine))
          moveData = parseMoveLine(engineLine)
          moveData.coordinateMove = getCordinateMove(moveData.algebraMove, settings.moves)
          moveData.willAcceptDraw = getDrawEval(moveData.eval, settings.pVals.cfd, settings.moves)
          previousMoves.push(moveData)
          if (settings.stopId && moveData.id === settings.stopId) {
            log(chalk.red("reached stop id, stopping engine\n"))
            moveData.engineMove = null
            quitWasSent = true
            child.stdin.write('quit\n')
            if (settings.showPreviousMoves) moveData.previousMoves = previousMoves.slice(0,-1)
            resolve(moveData)
          }
        // the engine has selected a move, stop engine, and reolve promise  
        // with current move data
        // NOTE: if illegal move is sent to the egnine this crashes right now 
        // as engineLine will say "Illegal move" but give no move
        } else if (engineLine.includes('move') && !quitWasSent) {
          moveData.timeForMove = Date.now() - startTime
          log(chalk.blue(engineLine))
          child.stdin.write('quit\n')
          moveData.engineMove = engineLine.match(/move ([a-z][1-9][a-z][1-9]?.)/)[1]
          console2.log('timeForMove:', moveData.timeForMove)
          console2.log('willAcceptDraw:', moveData.willAcceptDraw)
          console2.log('coordinateMove:', moveData.coordinateMove)
          if (settings.showPreviousMoves) moveData.previousMoves = previousMoves.slice(0,-1)
          resolve(moveData)
        
        } else {
          log(chalk.red(engineLine))
        }
      }
   
    })
  })

  // log on process errors
  child.stderr.on('data', (data) => {
    log(chalk.red(data.toString()))
  })

  startTime = Date.now()
  await startEngine(child, settings)
 
  return movePromise
}

// fills any missing settings and logs when it happens
// this could be done with spread operators but I wanted to see logs
function fillDefaultSettings(settings) {
  for (const key in defaultSettings) {
    if (!settings[key] && defaultSettings[key] !== null) {
      console2.log(`using deafault ${key}: ${defaultSettings[key]}`)
      settings[key] = defaultSettings[key]
    }
  }
  return settings
}

function getDrawEval(currentEval, contemptForDraw, moves) {
  // first the game must be at least 30 half moves (15 moves) long
  if (moves.length <= 30) return false
  contemptForDraw = parseInt(contemptForDraw)
  // console2.log('eval:', currentEval)
  // console2.log('cfd:', contemptForDraw)
  // console2.log('drawEval:', currentEval + contemptForDraw)
  return (currentEval + contemptForDraw) < 0
}

function parseMoveLine(engineLine) {
  const depth = parseInt(engineLine) 
  const eval = parseInt(engineLine.substring(5))
  const time = parseInt(engineLine.substring(11))
  const id = parseInt(engineLine.substring(18))
  const line = engineLine.substring(29)
  let algebraMove = line.split(' ')[0].replace('\r\n', '')
  // cm egine uses 0 instead of O which breaks chess.js, this is the fix
  algebraMove = algebraMove.replace(/0/g, 'O')
  algebraMove = algebraMove.replace(/\s/, '')

  return { depth, eval, time, id, algebraMove }
}

function getCordinateMove(algebraMove, moves) {
  const chess = chessTools.create()
  chess.applyMoves(moves)
 
  // try and use chess js to do the work for us
  let longMove = chess.chess.move(algebraMove, {sloppy: true})
  if (longMove) return longMove.from + longMove.to

  // chess js didn't like the move for some reason
  console2.error('Failed to create coordinate move!')
  return null
}


let countToThrow = 0
// startEngine sets up the engine and kicks off the move
async function startEngine(child, settings) {

  const { moves, pVals, secondsPerMove, clockTime,  } = settings
  // pVals.md = 6
  
  // establish a working model of the game and find white or blacks turn
  const chess = chessTools.create()
  chess.applyMoves(moves)
  const turn = chess.turn()
  
  // setup basic params
  child.stdin.write('xboard\n')
  child.stdin.write('post\n')
  
  // Load personality values
  child.stdin.write('cm_parm default\n')
  child.stdin.write(`cm_parm opp=${pVals.opp} opn=${pVals.opn} opb=${pVals.opb} opr=${pVals.opr} opq=${pVals.opq}\n`)
  child.stdin.write(`cm_parm myp=${pVals.myp} myn=${pVals.myn} myb=${pVals.myb} myr=${pVals.myr} myq=${pVals.myq}\n`)
  child.stdin.write(`cm_parm mycc=${pVals.mycc} mymob=${pVals.mymob} myks=${pVals.myks}  mypp=${pVals.mypp} mypw=${pVals.mypw}\n`)
  child.stdin.write(`cm_parm opcc=${pVals.opcc} opmob=${pVals.opmob} opks=${pVals.opks} oppp=${pVals.oppp} oppw=${pVals.oppw}\n`)
  child.stdin.write(`cm_parm cfd=${pVals.cfd} sop=${pVals.sop} avd=${pVals.avd} rnd=${pVals.rnd} sel=${pVals.sel} md=${pVals.md}\n`)
  child.stdin.write(`cm_parm tts=${pVals.tts}\n`)
  child.stdin.write('easy\n')

  if (clockTime) {
    console2.log(`clock time manually set to ${clockTime}`)
  } else {
    console2.log(`seconds per move is ${secondsPerMove}`)
  } 
  const moveTime = clockTime || (secondsPerMove * 100 * 40)  

  console2.log(`time ${moveTime}`)
  console2.log(`otim ${moveTime}`)
  child.stdin.write(`time ${moveTime}\n`)
  child.stdin.write(`otim ${moveTime}\n`)

  
  // send all the moves to the engine
  // console2.log(moves)
  console2.log(`sending ${moves.length} moves to the engine`)  
  for (const move of moves) {
    child.stdin.write(`${move}\n`)
  }
  
  // log which move the engine is playing
  if (turn == 'w') {
    console2.log('engine moving as white')
  } else {
    console2.log('engine moving as black')
  }
  
  // kick off the engine
  child.stdin.write('go\n')
}

function log(data) {
  if (logLevel === 'quiet' || logLevel === 'silent') return 
  process.stdout.write(data)
}

function log2(data) {

}

function setLogLevel(logLevelToSet) {
  logLevel = logLevelToSet
  if (logLevel === 'silent') {
    console2 = { log() {} }
  } else {
    console2 = console
  }
}

module.exports = { getMove, setLogLevel }
