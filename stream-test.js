require('dotenv').config()
const LichessApi = require("./bot-o-tron/src/LichessApi");
const RobotUser = require("./bot-o-tron/src/RobotUser");
const WizBot = require("./WizBot");
const RandomPlayer = require("./bot-o-tron/src/bots/RandomPlayer");

const streams = []


async function startBot(token, player) {
  const robot = new RobotUser(new LichessApi(token), player);
  const playerStream = robot.api.streamEvents((event) => {
    switch (event.type) {
      // case "challenge":
      //   this.handleChallenge(event.challenge);
      //   break;
      case "gameStart":
        const gameStream = robot.api.streamGame(event.game.id, (event) => {
          // console.log(event) 
        })
        streams.push(gameStream)
        break;
      default:
        console.log("Unhandled event : " + JSON.stringify(event))
    }
  })

  streams.push(playerStream)
}

startBot()