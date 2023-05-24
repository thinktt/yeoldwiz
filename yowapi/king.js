
const crypto = require('crypto')

module.exports = {
  getVersion
}

const kingHashMap = {
  '9bd6c1b16251e3a462c61c63b4811605a6072fbeb2311ebe7c05842dd0bfc236' : '9',
  'bc4d67847a6c34ce6792e4b0e52e53abba46e71438e1c4e7b22c91122b48e554' : '10',
  '511de09ec25fd8de0a41640c8e53ced4ebab1daeac01a8a9a3116a04f4ed7585' : '11', 
}

// returns a version number if the blob hash is found in the kingHashMap
async function getVersion(blob) {
  const hash = await getStringHash(blob)
  
  const keys = Object.keys(kingHashMap)

  if (!keys.includes(hash)) {
    console.log('incorrect king hash')
    console.log(hash)
    this.verificationFailed = true
    return
  }
  
  return kingHashMap[hash]

}

// function that conversts base64 to buffer
function b64ToBuffer(b64) {
  const byteString = atob(b64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
  }
  return ab
}

async function getStringHash(str) {
  const ab = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', ab)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}