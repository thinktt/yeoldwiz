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
}

// console.log(getProperName('Kasparov'))
// console.log(getProperName('chessmaster'))
// console.log(getProperName('cassie'))
// console.log(getProperName('Josh AGE 6'))
// console.log(getProperName('FIscher'))
// console.log(getProperName('Green Tentacle'))
// console.log(getProperName('pawnmaster'))
// console.log(getProperName('   DrawMaster  '))




