require('dotenv').config()
const gameManager = require("./game.js")
const chalk = require('chalk')
const api = require('./lichessApi.js')
const { json } = require('express')

start()

async function  start() {
  let err = null
  account = await api.accountInfo()
  if (!account) {
    console.error(chalk.red('failed to initialize lichess account, exiting'))
    process.exit()
  }

  console.log(`Connected to account ${account.data.username}`)
  api.streamEvents((event) => eventHandler(event))
  return account
}

function eventHandler(event) {
  process.stdout.write(chalk.blueBright(`main event: ${event.type} `))

  switch (event.type) {
    case 'challenge':
      console.log(chalk.blueBright(`${event?.challenge.id} from ${event?.challenge.challenger.id}`))
      handleChallenge(event.challenge)
      break
    case 'gameStart':
      console.log(chalk.green(`${event.game.id}`))
      handleGameStart(event.game.id)
      break
    case 'gameFinish': 
      console.log(chalk.green(`${event.game.id}`))
      break 
    case 'challengeDeclined':
      console.log(chalk.blueBright(`${event?.challenge.id}`))
      break
    default:
      console.log(chalk.yellow('unhandled event'))
  }
}

function handleGameStart(id) {
  const game = gameManager.create(id)
}

async function handleChallenge(challenge) {

  // if this is a challenge we sent to someone else just ignore it
  const botName = process.env.LICHESS_BOT_NAME
  const challengerName = challenge.challenger.name
  if (challengerName === botName) return
  
  // if we're in challenge mode decline any external challenges
  const isInChallengeMode = process.env.IN_CHALLENGE_MODE 
  if (isInChallengeMode) {
    const res = await api.declineChallenge(challenge.id, 'generic')
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
