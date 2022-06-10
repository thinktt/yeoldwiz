require('dotenv').config()
const gameManager = require("./game.js");
const chalk = require('chalk')
const api = require('./lichessApi.js')

start()

async function  start() {
  account = await api.accountInfo();
  // console.log("Playing as " + account.data.username)
  api.streamEvents((event) => eventHandler(event))
  return account
}

function eventHandler(event) {
  // console.log(chalk.blue(event.type)) 
  switch (event.type) {
    case "challenge":
      handleChallenge(event.challenge);
      break;
    case "gameStart":
      handleGameStart(event.game.id);
      break;
    case "gameFinish": 
      console.log(`Game ${event.game.id} completed`)
      break; 
    default:
      console.log("Unhandled event : " + JSON.stringify(event));
  }
}

function handleGameStart(id) {
  const game = gameManager.create(id)
}

async function handleChallenge(challenge) {
  const validVariants = ['standard']
  const validSpeeds = ['rapid', 'classical', 'correspondence']

  console.log(challenge.variant.key)
  console.log( challenge.speed)
  console.log('validVariant: ' + validVariants.includes(challenge.variant.key))
  console.log('validSpeed:' + validSpeeds.includes(challenge.speed))
    
  let declineReason = 'generic'
  if (!validVariants.includes(challenge.variant.key)) {
    declineReason = 'standard'
  } else if (!validSpeeds.includes(challenge.speed)) {
    declineReason = 'timeControl'
  }


  if (validVariants.includes(challenge.variant.key) && validSpeeds.includes(challenge.speed)) {
    console.log("Accepting unrated challenge from " + challenge.challenger.id)
    const response = await api.acceptChallenge(challenge.id)
    if (response) console.log("Accepted", response.data || response)
  } else {
    console.log("Declining  callenge from " + challenge.challenger.id)
    const response = await api.declineChallenge(challenge.id, declineReason)
    if (response) console.log("Declined", response.data || response)
  }
}



module.exports = {
  start,
  eventHandler,
  handleGameStart, 
}
