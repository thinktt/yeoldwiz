
const crypto = require('crypto')

module.exports = {
  getVersion
}

const kingHashMap = {
  'f33e751f2b8467193bceee7e480f796b37deeca7259dcc2d420ae395f78de524' : 'D',
  '37af49d12dbe9cc5b7b63229d54ffd6b1861086679bef9575a49ebe4c9040b65' : '9',
  'd756394d66e30cce156145f74d84b455515a157e8e7803ab7b3632d300dfed17' : '10',
  '44eba7a5c61a1ebcfc65b03772172a6b7db0cf5ede96ac5161e6b7a351959743' : '11', 
}

// returns a version number if the blob hash is found in the kingHashMap
async function getVersion(blob) {
  // console.log(blob)
  const hash = await getStringHash(blob)
  
  const keys = Object.keys(kingHashMap)

  if (!keys.includes(hash)) {
    console.log('incorrect king hash')
    console.log(hash)
    return
  }
  
  return kingHashMap[hash]
}

async function getStringHash(str) {
  const ab = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', ab)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}