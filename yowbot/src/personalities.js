const cmps = require('./personalities.json')

// Map the CMP Object to an array, sort them by rating, reverse them 
// for top to bottom flow when building layout
let cmpsArr = Object.entries(cmps).map(e => e[1])

cmpsArr.sort((cmp0, cmp1) => {
  if ( cmp0.rating < cmp1.rating ) return -1
  if ( cmp0.rating > cmp1.rating ) return 1
  if ( cmp0.rating === cmp1.rating ) return 0
})
const gms = []
for (const cmp of cmpsArr) {
  // console.log(cmp.rating)
  if (cmp.rating === 2700) gms.push(cmp)
}
// console.log(gms)



const aliases = {
  'josh age 6': 'Josh6',
  'josh age 7': 'Josh7',
  'josh age 8': 'Josh8',
  'josh age 9': 'Josh9',
  'josh age 12': 'Josh12',
  'nyckid6': 'Josh6',
  'nyckid7': 'Josh7',
  'nyckid8': 'Josh8',
  'nyckid9': 'Josh9',
  'nyckid9': 'Josh9',
  'nyckid12': 'Josh12',
  'jw6':  'Josh6',
  'jw7': 'Josh7',
  'jw8': 'Josh8',
  'jw9': 'Josh9',
  'jw12': 'Josh12',
  'the wizard': 'Wizard',
  'pawnmaster': 'Shakespeare',
  'drawmaster': 'Logan',
}

// Parse a string with multiple possible configurations and find a personality
function fuzzySearch(msg) {
  msg = msg.toLowerCase()
  // console.log('message:', msg)
  
  // check for random
  if ( msg.includes('random') ) {
    return cmpsArr[Math.floor(Math.random() * cmpsArr.length)];
  }
    

  // first check the aliases
  for (const alias of Object.keys(aliases)) {
    if ( msg.includes(alias) ) return cmps[aliases[alias]]
  }

  // check all the personalities
  for (const name of Object.keys(cmps)) {
    if ( msg.includes(name.toLocaleLowerCase()) ) return cmps[name]
  }

  // check for a catagory

  // check for GM
  if (msg.includes('gm') || msg.includes('grandmaster')) {
    return gms[Math.floor(Math.random() * gms.length)];
  }

  // check for a rating number
  let num = msg.match(/\d+/g)
  if (!num) return 
  
  // if there is a number in the msg we'll parse it and return 
  // the nearest personality
  num = parseInt(num) 
  
  // this is a GM return a random one
  if (num == 2700) {
    return gms[Math.floor(Math.random() * gms.length)];
  }
  
  // return the nearest personality at or below this rating
  for (cmp of cmpsArr) {
    if (num <= cmp.rating) return cmp
  }

}

function getSettings(name) {
  // first check the aliases
  name = name.toLowerCase()
  if (aliases[name]) {
    return cmps[aliases[name]]
  }  

  // Now try for the personality directly
  // All names are upercase so fix that first
  name = name[0].toUpperCase() + name.slice(1)
  if (cmps[name]) {
   return cmps[name]
  }

  return null
  // No personality found at this point so return fallback
  // console.log(`Personality ${name} not found, defaulting to JW7`)
  // return cmps['Josh7']
}

function getProperName(name) {
  const cmp = getSettings(name.trim()) 
  // No personality with this name exist, return empty string
  if (!cmp) return ''
  
  let properName = cmp.name
  
  // replace Chessmaster and Josh wtih their aliases
  if ( properName === 'Chessmaster') properName = 'Wizard'
  if ( properName.includes('Josh')) properName = properName.replace('Josh', 'JW')
  return properName
}

module.exports = {
  getSettings,
  getProperName,
  fuzzySearch,
}

function testFuzzySearch() {
  // console.log(fuzzySearch('His name is Josh age 6')?.name)
  // console.log(fuzzySearch('Go get me the Wizard')?.name)
  // console.log(fuzzySearch('Have you ever met NYCKid8')?.name)
  // console.log(fuzzySearch("I'm a fand of the PAWNMASTER")?.name)
  // console.log(fuzzySearch("play the DRAWmaster")?.name)
  
  // console.log(fuzzySearch("play the Max")?.name)
  // console.log(fuzzySearch("cassie is a neat player")?.name)
  // console.log(fuzzySearch("Bobby Fischer")?.name)
  
  // console.log(fuzzySearch("1200")?.name)
  // console.log(fuzzySearch("500 200 300")?.name)
  // console.log(fuzzySearch("I want to play a 1200 player")?.name)
  // console.log(fuzzySearch("1231")?.name)
  
  // console.log(fuzzySearch("GM please")?.name)
  // console.log(fuzzySearch(" I BeAT a 2700!!!!!")?.name)
  // console.log(fuzzySearch("hit me with random dude")?.name)
  // console.log(fuzzySearch("play Rand")?.name)

  // console.log(fuzzySearch("joey and ross sitting in tree")?.name)
  // console.log(fuzzySearch("go Team")?.name)
  // console.log(fuzzySearch('Have you ever met Josh')?.name)

}

// testFuzzySearch()



function testGetProperName() {
  console.log(getProperName('Kasparov'))
  console.log(getProperName('chessmaster'))
  console.log(getProperName('cassie'))
  console.log(getProperName('Josh AGE 6'))
  console.log(getProperName('FIscher'))
  console.log(getProperName('Green Tentacle'))
  console.log(getProperName('pawnmaster'))
  console.log(getProperName('   DrawMaster  '))
}





