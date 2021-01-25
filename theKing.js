const exec = require('child_process').exec
const child = exec('C:/Users/Toby/code/yeoldwiz/InBetween.exe')
child.stdout.on('data', (data) => {
  process.stdout.write(`${data}`);
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
  'g2g4', 'd3e2', 'c2c4', 'e2c4', 'h3g1',
  'd8d6', 'e3e4', 'd5e4', 'g4g5', 'e4f3',
  'e1f2', 'h7h5', 'g1e2', 'h5h4', 'h1f1',
  'd6d4', 'e2d4', 'c5d4', 'f2f3', 'c4f1',
  'b1c3', 'd4c3', 'b2b3', 'c3c2', 'f3f4',
  'e7e5', 'f4e4', 'f8c5', 'g5g6', 'f7g6',
  'e4f3', 'g8f6', 'a2a3', 'h4h3', 'a1b1',
  'h8h5', 'b1a1', 'h5f5', 'f3g3', 'f6h5',
  'g3h4', 'g6g5', 'h4g4', 'f1e2', 'g4h3',
  'h5f4'
]

for (const move of moves) {
  child.stdin.write(`${move}\n`)
}
child.stdin.write('go\n')
child.stdin.write('quit\n') 





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
