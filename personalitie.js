const fs = require('fs');

arg = process.argv[2] || ''
const name = (arg.charAt(0).toUpperCase() + arg.slice(1))
console.log(name)
path='./personalities'
// path='/mnt/c/Users/Toby/Games/CM11/Data/Personalities'


fs.readFile(`${path}/${name}.CMP`, (err, data) => {
  if (err) throw err;
  const cmp = {}
  cmp.version = ab2str(data.buffer.slice(0,32))
  cmp.book = ab2str(data.buffer.slice(192, 453))
  cmp.summary = ab2str(data.buffer.slice(482, 582))
  cmp.bio = ab2str(data.buffer.slice(582, 1581))
  cmp.paramsRaw = new Int32Array(data.buffer.slice(32,192))
  cmp.rating = cmp.paramsRaw[6]
  cmp.style = ab2str(data.buffer.slice(1582)).replace('%d', cmp.rating)

  console.log(cmp)


})


function printRawParams(params) {
  for (let i=0; i < params.length; i++) {
    process.stdout.write(`${params[i]} `);
    if ((i + 1) % 4 == 0 ) process.stdout.write('\n')
    // if ((i + 1) % 16 == 0 ) process.stdout.write('\n')
  }
}

function getIntsFromBuff(buffArr) {
  let ints = []
  for (let i=0; i < buffArr.byteLength; i++) {
    console.log(buffArr.readInt32LE(i))
    ints.push(buffArr.readInt32LE(i))
  }
  return ints
}

function ab2strRaw(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function ab2str(buf) {
  let charCodes =  new Uint8Array(buf)
  let str = ''
  for (code of charCodes) {
    if (code == 0) break
    let char = String.fromCharCode(code)
    str = str.concat(char)
  }
  return str
}