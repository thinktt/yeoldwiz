const { exec } = require('child_process')
// const cmd = 'C:/Users/Toby/code/yeoldwiz/InBetween.exe'
const cmd = 'C:/Users/Toby/code/yeoldwiz/TheKing350noOpk.exe'
const child = exec(cmd)
child.stdout.on('data', (data) => {
  if (data.toString().includes('move')) {
    process.stdout.write(`${data}`);
    child.stdin.write('quit\n')
  }
});

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

//get's engine to move in about 10 seconds
child.stdin.write('time 40000\n')
child.stdin.write('otim 40000\n')

// don't ponder (for now) prepare to take move list
child.stdin.write('easy\n')
child.stdin.write('force\n')


const moves = [
  'e2e3', 'd7d5', 'f2f3', 'c7c5', 'f1a6',
  'b7a6', 'd1e2', 'c8f5', 'g1h3', 'f5d3',
  'g2g4', 'd3e2', 'c2c4', 'e2c4', 'h3g1'
]

for (const move of moves) {
  child.stdin.write(`${move}\n`)
}
child.stdin.write('go\n')
// child.stdin.write('quit\n') 





// const child = spawn('C:/Users/Toby/code/yeoldwiz/TheKing350noOpk.exe')
// child.stdout.on('data', (data) => {
//   process.stdout.write(`${data}`);
// });
// child.stderr.on('data', (data) => {
//   console.log(`err: ${data}`);
// });




// const child = spawn('C:/Users/Toby/code/yeoldwiz/TheKing350noOpk.exe');
// const child = spawn('C:/Users/Toby/code/yeoldwiz/InBetween.exe',  []);

// child.stdin.setEncoding('utf-8');
// child.stdout.pipe(process.stdout);

// child.on('close', function (code) {
//     console.log('process exit code ' + code);
// });

// child.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// child.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });

// child.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });


//noinspection JSUnresolvedFunction
// child.stdout.setEncoding('utf8');
// child.stdout.on('data', function (data) {
//     var str = data.toString()
//     var lines = str.split(/(\r?\n)/g);
//     console.log(lines.join(""));
// });

// child.stderr.on('data', function (data) {
//     var str = data.toString()
//     var lines = str.split(/(\r?\n)/g);
//     console.log(lines.join(""));
// });

// child.stdin.write('# HELLO');





// child.stdin.end()
