require('dotenv').config()
const LichessApi = require("./bot-o-tron/src/LichessApi");
const RobotUser = require("./bot-o-tron/src/RobotUser");
const WizBot = require("./WizBot");
const RandomPlayer = require("./bot-o-tron/src/bots/RandomPlayer");
const chalk = require('chalk')


/**
 * Start a RobotUser (lichess account defined by API_TOKEN) that listens for challenges
 * and spawns games for unrated challenges. A player object must be supplied that can
 * produce the next move to play given the previous moves.
 * 
 * Token can be created on BOT accounts at https://lichess.org/account/oauth/token/create
 * Put the token in the shell environment with
 * 
 * export API_TOKEN=xxxxxxxxxxxxxx
 * yarn install
 * yarn start
 * 
 */


async function startBot(token, player) {
  if (token) {
    let robot = new RobotUser(new LichessApi(token), player);
    robot.handleChallenge = handleChallenge
    // const username = (await robot.start()).data.username;
    
    console.log(chalk.red(await isHealthy(robot)))

    // await new Promise(r => setTimeout(r, 5000))
    // if (await isHealthy(robot)) {
    //   console.log(chalk.yellow('Bot looks healthy'))
    // } else {
    //   console.log(chalk.yellow('Bot looks to be stuck'))
    // }

  }
}

async function handleChallenge(challenge) {
  // console.log(challenge)
  const validVariants = ['standard']
  const validSpeeds = ['rapid', 'classical', 'correspondence',]
  // const response = await api.declineChallenge(challenge.id);
  // console.log("Declined", response.data || response);

  console.log(challenge.variant.key)
  console.log( challenge.speed)
  console.log('validVariant: ' + validVariants.includes(challenge.variant))
  console.log('validSpeed:' + validSpeeds.includes(challenge.speed))

  if (validVariants.includes(challenge.variant.key) && validSpeeds.includes(challenge.speed) && !challenge.rated) {
    console.log("Accepting unrated challenge from " + challenge.challenger.id);
    const response = await this.api.acceptChallenge(challenge.id);
    console.log("Accepted", response.data || response);
  } else {
    console.log("Declining rated challenge from " + challenge.challenger.id);
    const response = await this.api.declineChallenge(challenge.id);
    console.log("Declined", response.data || response);
  }
}


startBot(process.env.API_TOKEN, new RandomPlayer())

async function isHealthy(robot) {
  let resp = await robot.api.currentGames()
  let games = []
  if (resp.data && resp.data.nowPlaying) {
    games = resp.data.nowPlaying
  } else {
    console.log('Error getting current games') 
    return true
  }

  const gamesWaiting = {}
  games.forEach(game => {
    if (game.isMyTurn) gamesWaiting[game.fullId] = game.fen
  })  
  await new Promise(r => setTimeout(r, 5000));


  resp = await robot.api.currentGames()
  games = []
  if (resp.data && resp.data.nowPlaying) {
    games = resp.data.nowPlaying
  } else {
    console.log('Error getting current games') 
    return true
  }

  games.forEach(game => {
    // console.log(chalk.yellow(JSON.stringify(game)))
    if (game.isMyTurn && gamesWaiting[game.fullId] == game.fen) {
      return false
    }
  })  

  return true
}




