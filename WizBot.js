const ChessUtils = require("./bot-o-tron/src/utils/ChessUtils")
const spawn = require('child_process').spawn


/**
 * Pick a random legal move.
 */
class WizBot {

  getNextMove(moves) {
    console.log(moves)
    const chess = new ChessUtils()
    chess.applyMoves(moves)
    const legalMoves = chess.legalMoves()
    if (legalMoves.length) {
      return chess.pickRandomMove(legalMoves)
    }
  }

  getReply(chat) {
    return "Howdy!"
  }

}

// Start and engine running as Josh 7
function getMove(currentMoves) {
  const child = spawn('C:/Users/Toby/code/yeoldwiz/TheKing350noOpk.exe')
  child.stdout.on('data', (data) => {
    process.stdout.write(`${data}`)
  })
  child.stderr.on('data', (data) => {
    console.log(`err: ${data}`)
  })

  child.stdin.write('xboard\n')
  child.stdin.write('post\n')
  child.stdin.write('new\n')

  // Josh 7
  child.stdin.write('cm_parm default\n')
  child.stdin.write('cm_parm opp=83 opn=83 opb=94 opr=88 opq=92\n')
  child.stdin.write('cm_parm myp=83 myn=83 myb=94 myr=88 myq=92\n')
  child.stdin.write('cm_parm mycc=162 mymob=175 myks=93 mypp=137 mypw=100\n')
  child.stdin.write('cm_parm opcc=162 opmob=175 opks=93 oppp=137 oppw=100\n')
  child.stdin.write('cm_parm cfd=300 sop=30 avd=-45 rnd=12 sel=6 md=99\n')
  child.stdin.write('cm_parm tts=16777216\n')
  
  // don't ponder (for now) prepare to take move list
  child.stdin.write('time 40000\n')
  child.stdin.write('otim 40000\n')
  child.stdin.write('easy\n')
  child.stdin.write('force\n')

  return 
}




module.exports = WizBot
