const cmps = require('./personalities.json')


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
  'jw12': 'Josh12',
  'wizard': 'Chessmaster',
  'the wizard': 'Chessmaster',
  'pawnmaster': 'Shakespeare',
  'drawmaster': 'Logan',
}

// Parse a string with multiple possible configurations and find a personality
function fuzzySearch(msg) {
  msg = msg.toLowerCase()

  // first check the aliases
  for (const alias of Object.keys(aliases)) {
    if ( msg.includes(alias) ) return cmps[aliases[alias]]
  }

  // check all the personalities
  for (const name of Object.keys(cmps)) {
    if ( msg.includes(name.toLocaleLowerCase()) ) return cmps[name]
  }

  // check for a catagory
  // check for random
  // check for a rating

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
  console.log(fuzzySearch('His name is Josh age 6')?.name)
  console.log(fuzzySearch('Go get me the Wizard')?.name)
  console.log(fuzzySearch('Have you ever met Josh')?.name)
  console.log(fuzzySearch('Have you ever met NYCKid8')?.name)
  console.log(fuzzySearch("I'm a fand of the PAWNMASTER")?.name)
  console.log(fuzzySearch("play the DRAWmaster")?.name)

  console.log(fuzzySearch("play the Max")?.name)
  console.log(fuzzySearch("cassie is a neat player")?.name)
  console.log(fuzzySearch("joey hates ross")?.name)
  console.log(fuzzySearch("go Team")?.name)
  console.log(fuzzySearch("Bobby Fischer")?.name)

}

testFuzzySearch()



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





