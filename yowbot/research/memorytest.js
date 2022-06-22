const ChessUtils = require('../src/ChessUtils.js') 
const chessTools = require('../src/chessTools.js')






const games = []
for (let i=0; i < 100000; i++) {
  games.push(new ChessUtils())
  // games.push(chessTools.create())
}


const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`)