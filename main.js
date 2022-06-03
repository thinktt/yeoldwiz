require('dotenv').config()
const lichessApi = require("./lichessApi");
const bot = require("./bot");
const wizBot = require("./wizBot");
const chalk = require('chalk')


// Lichess API token is reuqired, can be create at 
// https://lichess.org/account/oauth/token/create
//  export API_TOKEN=xxxxxxxxxxxxxx

lichessApi.setToken(process.env.API_TOKEN)
startBot()

async function startBot() {
  await bot.start(lichessApi, wizBot)
  // let robot = new RobotUser(lichessApi, wizBot);
  // const username = (await robot.start()).data.username;
}




// async function doHealthCheckLoop() {
//   await new Promise(r => setTimeout(r, 5000))
//   // do health check every 30 minutes
//   const waitTime = 30 * 60 * 1000
//   console.log(chalk.yellow(`Starting health check every ${waitTime / 60000} minutes`))
//   while (await isHealthy(robot)) {
//     // wait waitTime then check health
//     await new Promise(r => setTimeout(r, waitTime));
//   }

//   console.log('Health check failed, shutting down for daemon restart')
//   process.exit(1)
// }

// async function isHealthy(robot) {
//   // todo, also check if any challenges are waiting 

//   // get games in play, if none consider bot healthy
//   let games = await getCurrentGames(robot)
//   if (games.length == 0) return true

//   // create map of games currently waiting for the engine to move
//   const gamesWaiting = {}
//   games.forEach(game => {
//     if (game.isMyTurn) gamesWaiting[game.fullId] = game.fen
//   })  
  
//   await new Promise(r => setTimeout(r, 30000));

//   // get the games again now
//   games = await getCurrentGames(robot)
//   if (games.length == 0) return true

//   for (game of games) {
//     if (game.isMyTurn && gamesWaiting[game.fullId] == game.fen) {
//       return false
//     }
//   } 

//   return true
// }

// async function getCurrentGames(robot) {
//   let resp = await robot.api.currentGames()
//   let games = []
//   if (resp.data && resp.data.nowPlaying) {
//     games = resp.data.nowPlaying
//   } else {
//     console.log('Error getting current games') 
//     return []
//   }
//   return games 
// }

