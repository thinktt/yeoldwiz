require('dotenv').config()
const gameManager = require("./game.js")
const chalk = require('chalk')
const api = require('./lichessApi.js')
// const whip = require('./whip.js') 
// const { json } = require('express')

start()
console.log(process.env.BOTS_ARE_OK)

async function  start() {
  let err = null
  account = await api.accountInfo()
  if (!account) {
    console.error(chalk.red('failed to initialize lichess account, exiting'))
    process.exit()
  }

  console.log(`Connected to account ${account.data.username}`)

  // start the stream and set an error handler to restart if it crashes using a backoff strategy
  const { controller } = await api.streamEvents(eventHandler)
  // whip.start(controller)

  // test the restart on failure functionality by aboriting the stream
  // await new Promise(r => setTimeout(r, 3000))
  // controller.abort()

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

async function handleGameStart(id) {
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
  const validSpeeds = ['blitz', 'rapid', 'classical', 'correspondence']

  const isValidVariatn = validVariants.includes(challenge.variant.key)
  const isValidSpeed = validSpeeds.includes(challenge.speed)
  const isValidUser = gameManager.checkIsValidUser(challenge.challenger.id)
  
  let isValidPlayerType = true
  if (challenge.challenger.title === 'BOT' && process.env.BOTS_ARE_OK !== 'true') {
    isValidPlayerType = false
  }
  const isRated = challenge.rated

  console.log(
    `${challenge.id} ` + 
    `validVariant: ${isValidVariatn} ` +
    `validSpeed: ${isValidSpeed} validUser: ${isValidUser} ` +
    `validPlayerType: ${isValidPlayerType} ` + 
    `isRated: ${isRated}`
  )
  // console.log(challenge)

    
  let declineReason = 'generic'
  if (!isValidPlayerType) {
    declineReason = 'noBot'
  } else  if (!validVariants.includes(challenge.variant.key)) {
    declineReason = 'standard'
  } else if (!validSpeeds.includes(challenge.speed)) {
    declineReason = 'tooFast' // 'timeControl'
  } else if (!isValidUser) {
    declineReason = 'later'
  }

  if (isValidVariatn && isValidSpeed && isValidUser && isValidPlayerType) {
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
