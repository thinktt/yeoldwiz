const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const { exec } = require('child_process')
const chalk = require('chalk')



// Start the engine and get next move using the given perosnality values (pvals)
async function getMove(moves, pvals) {

  // start the chess engine process, using the proper engine command
  // defaults to WSL setup, Dockerfile sets ENG_CMD /usr/bin/wine ./enginewrap
  let cmd = './enginewrap'
  cmd = process.env.ENG_CMD ||  cmd
  console.log(`engine cmd: ${cmd}`)
  const child = exec(cmd)

  // on close event stop the process
  child.on('close', function (code) {
      console.log('egine exited ' + code);
  });
 
  // create a movePromise, when engine responds with a move it resolves and
  // sends an exit command to the engine, closing the process
  const movePromise = new Promise(resolve => {
    child.stdout.on('data', (data) => {
      process.stdout.write(chalk.red(data.toString()))
      if (data.toString().includes('move')) {
        child.stdin.write('quit\n')
        const move = data.toString().match(/move ([a-z][1-9][a-z][1-9]?.)/)[1]
        resolve(move)
      }
    });
  })

  // log on process errors
  child.stderr.on('data', (data) => {
    process.stdout.write(chalk.red(data.toString()))
  })

  startEngine(child, moves, pvals)
 
  return movePromise
}

// startEngine sets up the engine and kicks off the move
async function startEngine(child, moves, pvals) {
  
  // establish a working model of the game and find white or blacks turn
  const chess = new ChessUtils()
  chess.applyMoves(moves)
  const turn = chess.turn()

  // set up the clock time
  // const clockTime='0 6:40 0'
  // const moveTime='40000'
  const clockTime='0 3:20 0'
  const moveTime='20000'
  console.log(clockTime)
  console.log(moveTime)
  
  // setu up basic params
  child.stdin.write('xboard\n')
  child.stdin.write('post\n')
  child.stdin.write('new\n')
  child.stdin.write(`level ${clockTime}\n`)
  child.stdin.write('cm_parm opk=150308\n')
  
  
  // Load personality values
  child.stdin.write('cm_parm default\n')
  child.stdin.write(`cm_parm opp=${pvals.opp} opn=${pvals.opn} opb=${pvals.opb} opr=${pvals.opr} opq=${pvals.opq}\n`)
  child.stdin.write(`cm_parm myp=${pvals.myp} myn=${pvals.myn} myb=${pvals.myb} myr=${pvals.myr} myq=${pvals.myq}\n`)
  child.stdin.write(`cm_parm mycc=${pvals.mycc} mymob=${pvals.mymob} myks=${pvals.myks}  mypp=${pvals.mypp} mypw=${pvals.mypw}\n`)
  child.stdin.write(`cm_parm opcc=${pvals.opcc} opmob=${pvals.opmob} opks=${pvals.opks} oppp=${pvals.oppp} oppw=${pvals.oppw}\n`)
  child.stdin.write(`cm_parm cfd=${pvals.cfd} sop=${pvals.sop} avd=${pvals.avd} rnd=${pvals.rnd} sel=${pvals.sel} md=${pvals.md}\n`)
  child.stdin.write(`cm_parm tts=${pvals.tts}\n`)
  child.stdin.write('easy\n')
  
  // prepare to take move list
  child.stdin.write('force\n')
  
  // send all the moves to the engine
  console.log(moves)  
  for (const move of moves) {
    child.stdin.write(`${move}\n`)
  }
  
  // establish which move the engine is playing
  child.stdin.write(`time ${moveTime}\n`)
  child.stdin.write(`otim ${moveTime}\n`)
  if (turn == 'w') {
    console.log('engine moving as white')
    child.stdin.write('white\n')
  } else {
    console.log('engine moving as black')
    child.stdin.write('black\n')
  }
  
  // kick off the engine
  child.stdin.write('go\n')
}

function isWhitesTurn(n) {
  return n % 2 == 0;
}

module.exports = { getMove }
