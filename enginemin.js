const { exec } = require('child_process')
const chalk = require('chalk')

// start the chess engine process, using the proper engine command
let cmd = process.cwd() + '/TheKing350noOpk.exe'
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

child.stdin.write('xboard\n')
child.stdin.write('post\n')
child.stdin.write(`time 2000\n`)
child.stdin.write(`otim 2000\n`)
child.stdin.write('go\n')

