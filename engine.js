const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const { exec } = require('child_process')
const chalk = require('chalk')


async function getMove(moves, pvals) {
  const moveData = await getMoveWithData(moves, pvals)
  return moveData.engineMove
}

// Start the engine and get next move using the given perosnality values (pvals)
async function getMoveWithData(moves, pvals) {

  // start the chess engine process, using the proper engine command
  // defaults to WSL setup, Dockerfile sets ENG_CMD /usr/bin/wine ./enginewrap
  let cmd = './enginewrap'
  cmd = process.env.ENG_CMD ||  cmd
  console.log(`engine cmd: ${cmd}`)
  const child = exec(cmd)
  let moveData
 
  // on close event stop the process
  child.on('close', function (code) {
      // console.log('egine exited ' + code)
  })


  // create a movePromise, when engine responds with a move it resolves and
  // sends an exit command to the engine, closing the process
  const movePromise = new Promise(resolve => {
    child.stdout.on('data', (data) => {
      const engineLines = data.toString().replace('\r','\n').split('\n')

      for (let engineLine of engineLines) {
        // ignore empty lines, add return char back to end of line
        if (engineLine === '') continue
        engineLine = engineLine + '\n'

        // if egineline starts with an int this is a move line, parse it and
        // store it in the moveData object
        if (parseInt(engineLine)) {
          process.stdout.write(chalk.yellow(engineLine))
          moveData = parseMoveLine(engineLine)
          moveData.cordinateMove = getCordinateMove(moveData.algebraMove, moves)
        
        // the engine has selected a move, stop engine, and reolve promise  
        // with current move data
        } else if (engineLine.includes('move')) {
          process.stdout.write(chalk.blue(engineLine))
          child.stdin.write('quit\n')
          moveData.engineMove = engineLine.match(/move ([a-z][1-9][a-z][1-9]?.)/)[1]
          moveData.timeForMove = Date.now() - startTime
          resolve(moveData)
        
        } else {
          process.stdout.write(chalk.red(engineLine))
        }
      }
   
    })
  })

  // log on process errors
  child.stderr.on('data', (data) => {
    process.stdout.write(chalk.red(data.toString()))
  })

  startTime = Date.now()
  startEngine(child, moves, pvals)
 
  return movePromise
}

function parseMoveLine(engineLine) {
  const depth = parseInt(engineLine) 
  const eval = parseInt(engineLine.substring(5))
  const shortDepth = parseInt(engineLine.substring(11))
  const longDepth = parseInt(engineLine.substring(18))
  const moveLine = engineLine.substring(29)
  const algebraMove = moveLine.split(' ')[0]
  return { depth, eval, shortDepth, longDepth, algebraMove }
}

function getCordinateMove(algebraMove, moves) {
  // cm egine uses 0 instead of O which breaks chess.js, this is the fix
  algebraMove = algebraMove.replace(/0/g, 'O')
  const chess = new ChessUtils()
  chess.applyMoves(moves)
  const longMove = chess.chess.move(algebraMove)
  
  // failed to build a cordinate move
  // if (!longMove) return null
  
  return longMove.from + longMove.to  
}

// startEngine sets up the engine and kicks off the move
async function startEngine(child, moves, pvals) {
  
  // establish a working model of the game and find white or blacks turn
  const chess = new ChessUtils()
  chess.applyMoves(moves)
  const turn = chess.turn()
  
  // setup basic params
  child.stdin.write('xboard\n')
  child.stdin.write('post\n')
  
  // Load personality values
  child.stdin.write('cm_parm default\n')
  child.stdin.write(`cm_parm opp=${pvals.opp} opn=${pvals.opn} opb=${pvals.opb} opr=${pvals.opr} opq=${pvals.opq}\n`)
  child.stdin.write(`cm_parm myp=${pvals.myp} myn=${pvals.myn} myb=${pvals.myb} myr=${pvals.myr} myq=${pvals.myq}\n`)
  child.stdin.write(`cm_parm mycc=${pvals.mycc} mymob=${pvals.mymob} myks=${pvals.myks}  mypp=${pvals.mypp} mypw=${pvals.mypw}\n`)
  child.stdin.write(`cm_parm opcc=${pvals.opcc} opmob=${pvals.opmob} opks=${pvals.opks} oppp=${pvals.oppp} oppw=${pvals.oppw}\n`)
  child.stdin.write(`cm_parm cfd=${pvals.cfd} sop=${pvals.sop} avd=${pvals.avd} rnd=${pvals.rnd} sel=${pvals.sel} md=${pvals.md}\n`)
  child.stdin.write(`cm_parm tts=${pvals.tts}\n`)
  child.stdin.write('easy\n')

  // set time control
  // child.stdin.write(`level 0 0 5\n`)
  const clockTime='0 3:20 0'
  const moveTime='20000'
  // child.stdin.write(`level ${clockTime}\n`)
  // child.stdin.write(`time ${moveTime}\n`)
  // child.stdin.write(`otim ${moveTime}\n`)
    
  // send all the moves to the engine
  // console.log(moves)
  console.log(`sending ${moves.length} moves to the engine`)  
  for (const move of moves) {
    child.stdin.write(`${move}\n`)
  }
  
  // log which move the engine is playing
  if (turn == 'w') {
    console.log('engine moving as white')
  } else {
    console.log('engine moving as black')
  }
  
  // kick off the engine
  child.stdin.write('go\n')
}

module.exports = { getMove, getMoveWithData }


// Thes are engine commands I removed since they didn't seem necessary
// keeping them here for reference for now though
// child.stdin.write('black\n')
// child.stdin.write('white\n')
// set up the clock time
// const clockTime='0 12:40 0'
// const moveTime='80000'
// const clockTime='0 3:20 0'
// const moveTime='20000'
// const clockTime='0 0:01 0'
// const moveTime='5000'
// child.stdin.write('new\n')
// child.stdin.write(`level ${clockTime}\n`)
// child.stdin.write('cm_parm opk=150308\n')
// prepare to take move list
// child.stdin.write('force\n')