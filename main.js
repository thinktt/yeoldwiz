require('dotenv').config()
const LichessApi = require("./bot-o-tron/src/LichessApi");
const RobotUser = require("./bot-o-tron/src/RobotUser");
const WizBot = require("./WizBot");
const RandomPlayer = require("./bot-o-tron/src/bots/RandomPlayer");


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
    const robot = new RobotUser(new LichessApi(token), player);

    robot.handleChallenge = async (challenge) => {
      console.log(challenge)
      const validVariants = ['standard']
      const validSpeeds = ['rapid', 'classical', 'correspondence',]
      // const response = await api.declineChallenge(challenge.id);
      // console.log("Declined", response.data || response);
      
      console.log(challenge.variant.key)
      console.log( challenge.speed)
      console.log('validVariant: ' + validVariants.includes(challenge.variant))
      console.log('validSpeed:' + validSpeeds.includes(challenge.speed))

     
      if (validVariants.includes(challenge.variant.key) && validSpeeds.includes(challenge.speed)) {
        console.log("Accepting unrated challenge from " + challenge.challenger.id);
        const response = await robot.api.acceptChallenge(challenge.id);
        console.log("Accepted", response.data || response);
      } else {
        console.log("Declining rated challenge from " + challenge.challenger.id);
        const response = await robot.api.declineChallenge(challenge.id);
        console.log("Declined", response.data || response);
      }
    
    }

    const username = (await robot.start()).data.username;
    return `<a href="https://lichess.org/?user=${username}#friend">${username}</a> on lichess.</h1><br/>`;
  }
}

async function begin() {
  var links = "<h1>Challenge:</h1><br/>";

  // links += await startBot(process.env.API_TOKEN, new WizBot());
  links += await startBot(process.env.API_TOKEN, new RandomPlayer());
  // links += await startBot(process.env.API_TOKEN_SWARM, new AntiPatzerPlayer());
  // heroku wakeup server (not necessary otherwise)
  const express = require("express");
  const PORT = process.env.PORT || 5000;

  const server = express()

  server.get("/", (req, res) => {
    res.send(links)
  })
    
  server.listen(PORT, () => console.log(`Wake up server listening on ${PORT}`));
}

begin();
