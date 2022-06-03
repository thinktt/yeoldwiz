require('dotenv').config()
const lichessApi = require("./lichessApi");
const RobotUser = require("./RobotUser");
const WizBot = require("./WizBot");
const chalk = require('chalk')

lichessApi.setToken(process.env.API_TOKEN)

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

 startBot(new WizBot())

async function startBot(player) {
  let robot = new RobotUser(lichessApi, player);
  const username = (await robot.start()).data.username;
  // doHealthCheckLoop()
}

async function doHealthCheckLoop() {
  await new Promise(r => setTimeout(r, 5000))
  // do health check every 30 minutes
  const waitTime = 30 * 60 * 1000
  console.log(chalk.yellow(`Starting health check every ${waitTime / 60000} minutes`))
  while (await isHealthy(robot)) {
    // wait waitTime then check health
    await new Promise(r => setTimeout(r, waitTime));
  }

  console.log('Health check failed, shutting down for daemon restart')
  process.exit(1)
}

async function isHealthy(robot) {
  // todo, also check if any challenges are waiting 

  // get games in play, if none consider bot healthy
  let games = await getCurrentGames(robot)
  if (games.length == 0) return true

  // create map of games currently waiting for the engine to move
  const gamesWaiting = {}
  games.forEach(game => {
    if (game.isMyTurn) gamesWaiting[game.fullId] = game.fen
  })  
  
  await new Promise(r => setTimeout(r, 30000));

  // get the games again now
  games = await getCurrentGames(robot)
  if (games.length == 0) return true

  for (game of games) {
    if (game.isMyTurn && gamesWaiting[game.fullId] == game.fen) {
      return false
    }
  } 

  return true
}


async function getCurrentGames(robot) {
  let resp = await robot.api.currentGames()
  let games = []
  if (resp.data && resp.data.nowPlaying) {
    games = resp.data.nowPlaying
  } else {
    console.log('Error getting current games') 
    return []
  }
  return games 
}

