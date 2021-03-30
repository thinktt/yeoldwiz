// This is a one time script for building out the personalities.json files from the 
// personalites.cfg and the CMP files

const fs = require('fs');

arg = process.argv[2] || ''
const name = (arg.charAt(0).toUpperCase() + arg.slice(1))
console.log(name)
path='./personalities'


run()
async function run() {
  const cmps = parseCmpCfg()
  for (key in cmps) {
    const cmpFileVals = await parseCmpFile(key)
    cmps[key] = { ...cmps[key], ...cmpFileVals }
  }
  // console.log(await parseCmpFile(name))
  // console.log(Object.keys(cmps).length)
  // console.log(cmps[name])
  fs.writeFileSync('personalities.json', JSON.stringify(cmps, null, 2))
}

async function parseCmpFile(name) {
  try {
    const cmp = await getPersonality(name)
    return cmp
  } catch (err) {
    console.log('Unable to open personality file for ' + name)
    return {}
  }
}

// Fully parese the raw engine strings in personalities.cfg
// into individual personalities
function parseCmpCfg() {
  const cmps = {}
  let cmpStrings = fs.readFileSync('./personalities.cfg', 'utf8')
  cmpStrings = cmpStrings.split('\r\n\r\n')
  cmpStrings.forEach((cmpStr) => {
    const params = parseEngStrings(cmpStr)
    cmps[params.name] = params
  })
  return cmps
}

// A big mess of parsing all the engine strings
function parseEngStrings(engStrings) {
  const personality = {out : {}}
  engStrings = engStrings.split('\r\n')
  personality.name = engStrings[0]
  personality.ponder = engStrings[7]
  let params = engStrings.slice(1, 7).join(' ').split(' ')
  params = params.filter(param => param != 'cm_parm')
  params.forEach((param) => {
    const paramPair = param.split('=')
    personality.out[paramPair[0]] = paramPair[1]
  })
  return personality
}


function getPersonality(name) {
  const filePromise = new Promise((resolve, reject) => {
    fs.readFile(`${path}/${name}.CMP`, (err, data) => { 
      if (err) {
        reject(err)
        return 
      }
        const cmp = {}
        cmp.version = ab2str(data.buffer.slice(0,32))
        cmp.book = ab2str(data.buffer.slice(192, 453))
        cmp.book = cmp.book.replace('.OBK', '.bin').replace('.obk', '.bin')
        cmp.face = ab2str(data.buffer.slice(452, 482))
        cmp.face = cmp.face.replace('.BMP', '.png').replace('.bmp', '.png')
        cmp.summary = ab2str(data.buffer.slice(482, 582))
        cmp.bio = ab2str(data.buffer.slice(582, 1581))
        cmp.raw = new Int32Array(data.buffer.slice(32,192))
        cmp.raw = Array.from(cmp.raw)
        cmp.rating = cmp.raw[6]
        cmp.style = ab2str(data.buffer.slice(1582)).replace('%d', cmp.rating)
        resolve(cmp)
    })
  })
  return filePromise
}


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