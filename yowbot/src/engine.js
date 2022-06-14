const ChessUtils = require("./ChessUtils")
const { exec } = require('child_process')
const chalk = require('chalk')
const { moves } = require("chess-tools/opening-books/ctg/moves")


async function getMove(moves, pvals, secondsPerMove) {
  
  const moveData = await getMoveWithData(moves, pvals, secondsPerMove)
  return moveData.engineMove
}

// Start the engine and get next move using the given perosnality values (pvals)
async function getMoveWithData(moves, pvals, secondsPerMove) {

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
        if (parseInt(engineLine) > 1000) {
          process.stdout.write(chalk.yellow(engineLine))
          moveData = parseMoveLine(engineLine)
          moveData.cordinateMove = getCordinateMove(moveData.algebraMove, moves)
          moveData.willAcceptDraw = getDrawEval(moveData.eval, pvals.cfd, moves)
          // console.log(moveData)
        
        // the engine has selected a move, stop engine, and reolve promise  
        // with current move data
        } else if (engineLine.includes('move')) {
          moveData.timeForMove = Date.now() - startTime
          process.stdout.write(chalk.blue(engineLine))
          child.stdin.write('quit\n')
          moveData.engineMove = engineLine.match(/move ([a-z][1-9][a-z][1-9]?.)/)[1]
          // console.log(moveData)
          console.log('timeForMove:', moveData.timeForMove)
          console.log('willAcceptDraw:', moveData.willAcceptDraw)
          console.log('cordanateMove:', moveData.cordinateMove)
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
  startEngine(child, moves, pvals, secondsPerMove)
 
  return movePromise
}

function getDrawEval(currentEval, contemptForDraw, moves) {
  // first the game must be at least 30 half moves (15 moves) long
  if (moves.length <= 30) return false
  contemptForDraw = parseInt(contemptForDraw)
  // console.log('eval:', currentEval)
  // console.log('cfd:', contemptForDraw)
  // console.log('drawEval:', currentEval + contemptForDraw)
  return (currentEval + contemptForDraw) < 0
}

function parseMoveLine(engineLine) {
  const depth = parseInt(engineLine) 
  const eval = parseInt(engineLine.substring(5))
  const shortDepth = parseInt(engineLine.substring(11))
  const longDepth = parseInt(engineLine.substring(18))
  const moveLine = engineLine.substring(29)
  let algebraMove = moveLine.split(' ')[0].replace('\r\n', '')
  // cm egine uses 0 instead of O which breaks chess.js, this is the fix
  algebraMove = algebraMove.replace(/0/g, 'O')
  algebraMove = algebraMove.replace(/\s/, '')

  return { depth, eval, shortDepth, longDepth, algebraMove }
}

function getCordinateMove(algebraMove, moves) {
  const chess = new ChessUtils()
  chess.applyMoves(moves)
 
  // try and use chess js to do the work for us
  let longMove = chess.chess.move(algebraMove, {sloppy: true})
  if (longMove) return longMove.from + longMove.to

  // chess js didn't like the move for some reason
  console.error('Failed to create cordinate move!')
  return null
}

// startEngine sets up the engine and kicks off the move
async function startEngine(child, moves, pvals, secondsPerMove) {
  
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
  // const clockTime='0 3:20 0'
  // child.stdin.write(`level ${clockTime}\n`)
  if (!secondsPerMove) {
    secondsPerMove = 5
    console.log(`No seconds per move set, defaulting to ${secondsPerMove}`)
  } else {
    console.log(`seconds per move is ${secondsPerMove}`)
  }
  const moveTime = (secondsPerMove * 100 * 40)
  console.log(`time ${moveTime}`)
  console.log(`otim ${moveTime}`)
  child.stdin.write(`time ${moveTime}\n`)
  child.stdin.write(`otim ${moveTime}\n`)
    
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


// function complexManualCoridnateParsing(algebraMove, moves) {
    // // chess js didn't like the move let's try a more manual approach
  // let disambiguation 
  // let disambigCordinate
  
  // // first let's check for full disambiguation, if it exist just return it as
  // // the move (ex. Qe4e5)
  // if (disambiguation = algebraMove.match(/[a-h][1-8][a-h][1-8]/)) {
  //   return disambiguation[0]
  // }
  
  // // next check for a single disambiguation cordinate, if so save it (ex. Qea1)
  // if (disambiguation = algebraMove.match(/([a-h|1-8])[a-h][1-8]/)) {
  //   disambigCordinate = disambiguation[1]
  // }

  // //todo translate promotion move

  // let toSquare = algebraMove.match(/[a-h][0-8]/)[0]
  // let piece = algebraMove.match(/[KQBNR]/)[0]


  // for (const square of chess.chess.SQUARES) {
  //   // is this the type of piece we're looking for? if not move along
  //   const boardPiece = chess.chess.get(square)
  //   if (!boardPiece) continue
  //   if (boardPiece.type !== piece.toLowerCase()) continue

  //   // now we have a candidate move
  //   let testMove = square + toSquare
  //   console.log(testMove)

  //   // if chessjs still doesn't like it move along
  //   let longMove = chess.chess.move(testMove)
  //   if (!longMove) continue

  //   // if there's a diabiguation cordinate make sure this is the right square
  //   // to move from (it should contain the cordinate) if not move on
  //   if (disambigCordinate && !square.includes(disambigCordinate)) continue 

    
  //   // we found our move we can stop searching for it
  //   cordinateMove = testMove
  //   break
  // }

  
  // // at this point if we never found a move we will be returning null
  // if (cordinateMove === null) {
  //   console.error('Failed to create cordinate move!')
  // }
  // return cordinateMove
// } 