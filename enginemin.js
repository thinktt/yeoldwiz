const { exec } = require('child_process')
const chalk = require('chalk')

console.log(chalk.blue('Starting engine'))

let child
function startCmd() {
  // let cmd = process.cwd() + '/simpleout'
  // let cmd = process.cwd() + '/TheKing350noOpk.exe'
  // let cmd ='wine TheKing350noOpk.exe'
  let cmd = '/usr/bin/wine enginewrap.exe'
  // let cmd = './enginewrap'
  child = exec(cmd) 
}

try {
  startCmd()
} catch (error) {
  console.log("we crashed starting the command")
  // console.log(error)
}

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
      // process.exit()
    }
  });
})

// log on process errors
child.stderr.on('data', (data) => {
  process.stdout.write(chalk.yellow(data.toString()))
})

child.stdin.write('xboard\n')
child.stdin.write('post\n')
child.stdin.write(`time 2000\n`)
child.stdin.write(`otim 2000\n`)
child.stdin.write('go\n')
