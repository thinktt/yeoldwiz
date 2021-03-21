const fs = require('fs');

arg = process.argv[2] || ''
const name = (arg.charAt(0).toUpperCase() + arg.slice(1))
console.log(name)
path='./personalities'
// path='/mnt/c/Users/Toby/Games/CM11/Data/Personalities'


fs.readFile(`${path}/${name}.CMP`, (err, data) => {
  if (err) throw err;
  let cmver = data.buffer.slice(0,32)
  let params = new Int32Array(data.buffer.slice(32,192))
  console.log(params.BYTES_PER_ELEMENT)
  console.log(params.length)

  for (let i=0; i < params.length; i++) {
    process.stdout.write(`${params[i]} `);
    if ((i + 1) % 4 == 0 ) process.stdout.write('\n')
    // if ((i + 1) % 16 == 0 ) process.stdout.write('\n')
  }
  console.log()
})


function getIntsFromBuff(buffArr) {
  let ints = []
  for (let i=0; i < buffArr.byteLength; i++) {
    console.log(buffArr.readInt32LE(i))
    ints.push(buffArr.readInt32LE(i))
  }
  return ints
}