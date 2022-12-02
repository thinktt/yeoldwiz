require('dotenv').config()
const gameManager = require("./game.js")
const chalk = require('chalk')
const api = require('./lichessApi.js')
const { json } = require('express')

start()

async function  start() {
  account = await api.accountInfo();
  console.log(`Connected to account ${account.data.username}`)
  api.streamEvents((event) => eventHandler(event))
  return account
}

function eventHandler(event) {
  process.stdout.write(chalk.blueBright(`main event: ${event.type} `))

  switch (event.type) {
    case 'challenge':
      console.log(chalk.blueBright(`${event?.challenge.id} from ${event?.challenge.challenger.id}`))
      handleChallenge(event.challenge);
      break;
    case 'gameStart':
      console.log(chalk.green(`${event.game.id}`))
      handleGameStart(event.game.id);
      break;
    case 'gameFinish': 
      console.log(chalk.green(`${event.game.id}`))
      break; 
    case 'challengeDeclined':
      console.log(chalk.blueBright(`${event?.challenge.id}`))
      break;
    default:
      console.log(chalk.yellow('unhandled event'))
  }
}

function handleGameStart(id) {
  const game = gameManager.create(id)
}

async function handleChallenge(challenge) {
  if (process.env.IN_CHALLENGE_MODE) {
    const response = await api.declineChallenge(challenge.id, 'generic')
    return
  }

  const validVariants = ['standard']
  const validSpeeds = ['bullet', 'blitz', 'rapid', 'classical', 'correspondence']

  const isValidVariatn = validVariants.includes(challenge.variant.key)
  const isValidSpeed = validSpeeds.includes(challenge.speed)
  console.log(`${challenge.id} validVariant: ${isValidVariatn} validSpeed ${isValidSpeed}`)
  // console.log(challenge.variant.key)
  // console.log( challenge.speed)

    
  let declineReason = 'generic'
  if (!validVariants.includes(challenge.variant.key)) {
    declineReason = 'standard'
  } else if (!validSpeeds.includes(challenge.speed)) {
    declineReason = 'timeControl'
  }

  if (isValidVariatn && isValidSpeed) {
    console.log(`Accepting challenge ${challenge.id} from ${challenge.challenger.id}`)
    const res = await api.acceptChallenge(challenge.id)
  } else {
    console.log(`Declining  callenge from ${challenge.id} from ${challenge.challenger.id}`)
    const res = await api.declineChallenge(challenge.id, declineReason)
  }
}



module.exports = {
  start,
  eventHandler,
  handleGameStart, 
}
