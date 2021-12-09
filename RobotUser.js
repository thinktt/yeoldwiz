const LichessApi = require("./LichessApi");
const Game = require("./Game");
const yowOpponents = require('./personalities.json')
const chalk = require('chalk')

/**
 * RobotUser listens for challenges and spawns Games on accepting.
 *  
 */
class RobotUser {

  /**
   * Initialise with access token to lichess and a player algorithm.
   */
  constructor(api, player) {
    this.api = api;
    this.player = player;
  }

  async start() {
    this.account = await this.api.accountInfo();
    // console.log("Playing as " + this.account.data.username);
    this.api.streamEvents((event) => this.eventHandler(event));
    return this.account;
  }

  eventHandler(event) {
    // console.log(chalk.blue(event.type)) 
    switch (event.type) {
      case "challenge":
        this.handleChallenge(event.challenge);
        break;
      case "gameStart":
        this.handleGameStart(event.game.id);
        break;
      default:
        console.log("Unhandled event : " + JSON.stringify(event));
    }
  }

  handleGameStart(id) {
    const game = new Game(this.api, this.account.data.username, this.player);
    game.start(id);
  }

  async handleChallenge(challenge) {
    const validVariants = ['standard']
    const validSpeeds = ['rapid', 'classical']
    // const response = await api.declineChallenge(challenge.id);
    // console.log("Declined", response.data || response);
    // return
  
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
      console.log("Accepting unrated challenge from " + challenge.challenger.id);
      const response = await this.api.acceptChallenge(challenge.id);
      console.log("Accepted", response.data || response);
    } else {
      console.log("Declining  callenge from " + challenge.challenger.id);
      const response = await this.api.declineChallenge(challenge.id, declineReason);
      console.log("Declined", response.data || response);
    }
  }

}

module.exports = RobotUser;
