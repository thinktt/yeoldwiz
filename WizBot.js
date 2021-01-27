const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const { exec } = require('child_process')
const { resolveTxt } = require("dns")
const chalk = require('chalk')
const book = require('./book')


class WizBot {

  async getNextMove(moves) {
    // console.log(moves)
    const chess = new ChessUtils()
    chess.applyMoves(moves)
    const legalMoves = chess.legalMoves()
    
    // if there are no legal moves then return
    if (!legalMoves.length) {
      return
    }

    const bookMove = await book.getRandomBookMove(chess.fen())
    if (bookMove != "") {
      console.log(`bookMove: ${bookMove}`)
      return bookMove
    }
    
    const engineMove = await getEgnineMove(moves, chess.turn())
    console.log(`engineMove: ${engineMove}`)
    return engineMove
  }

  getReply(chat) {
    return "Howdy!"
  }

}

// Start and engine running as Josh 7
async function getEgnineMove(moves, turn) {
  
  // const cmd = 'C:/Users/Toby/code/yeoldwiz/InBetween.exe'
  // const cmd = 'C:/Users/Toby/code/yeoldwiz/TheKing350noOpk.exe'
  const cmd = '/mnt/c/Users/Toby/code/yeoldwiz-lnx/TheKing350noOpk.exe'
  const child = exec(cmd)


  child.on('close', function (code) {
      console.log('egine exited ' + code);
  });
 
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
  
  child.stdin.write('xboard\n')
  child.stdin.write('post\n')
  child.stdin.write('new\n')
  child.stdin.write('level 0 3:20 0\n')
  child.stdin.write('cm_parm opk=357730\n')
  
  
  // Josh 7
  child.stdin.write('cm_parm default\n')
  child.stdin.write('cm_parm opp=83 opn=83 opb=94 opr=88 opq=92\n')
  child.stdin.write('cm_parm myp=83 myn=83 myb=94 myr=88 myq=92\n')
  child.stdin.write('cm_parm mycc=162 mymob=175 myks=93 mypp=137 mypw=100\n')
  child.stdin.write('cm_parm opcc=162 opmob=175 opks=93 oppp=137 oppw=100\n')
  child.stdin.write('cm_parm cfd=300 sop=30 avd=-45 rnd=12 sel=6 md=99\n')
  child.stdin.write('cm_parm tts=16777216\n')
  child.stdin.write('hard\n')
  
  //get's engine to move in about 10 seconds
  
  //prepare to take move list
  child.stdin.write('force\n')
  
  for (const move of moves) {
    child.stdin.write(`${move}\n`)
  }
  
  child.stdin.write('time 20000\n')
  child.stdin.write('otim 20000\n')
  if (turn = 'w') {
    console.log('engine moving as white')
    child.stdin.write('white\n')
  } else {
    console.log('engine moving a black')
    child.stdin.write('black\n')
  }
  
  child.stdin.write('go\n')

  return movePromise
}


function isWhitesTurn(n) {
  return n % 2 == 0;
}

module.exports = WizBot
