
/**
 * Game subscribes to gameId events and handles them posting moves
 * generated by player object that must implement two methods:
 * 
 * getNextMove(array of uciMoves) returns uciMove
 * getReply(chat event) returns chat message  
 * 
 */

const chalk = require('chalk')
const personalites = require('../../personalities')


class Game {

  /**
   * Initialise with interface to lichess.
   */
  constructor(api, name, player) {
    this.api = api;
    this.name = name;
    this.player = player;
  }

  async start(gameId) {
    this.gameId = gameId
    this.api.streamGame(gameId, (event) => this.handler(event));
  }

  handleChatLine(event) {
    if (event.username !== this.name) {
      const message = event.text.toLowerCase()
      if (this.wizPlayer == '') {
        let opponent = message.replace('play ', '').replace('as ', '').trim()
        this.wizPlayer = personalites.getProperName(opponent)
        
        if (!this.wizPlayer) { 
          this.api.chat(this.gameId, 'player', "Sorry, I don't know that opponent");
        } else {
          this.api.chat(this.gameId, 'player', `Playing as ${this.wizPlayer}`);
          this.api.chat(this.gameId, 'spectator', `Playing as ${this.wizPlayer}`);
          this.playNextMove(this.previousMoves)
        } 
      }
    }
  }

  async findAndSetWizPlayer() {
    let chatPlayer = await this.getWizPlayerFromChat()

    // If no opponent has been set in chat and this is a rated game set
    // the game to play as Josh7
    if ((chatPlayer === '' || chatPlayer === 'should ask who to play') &&  this.rated) {
      this.setWizPlayer('JW7')
      return
    }
    
    // This means chat has no messages at all so we should ask who the player wants to play
    if (chatPlayer === 'should ask who to play' && !this.rated) {
      this.api.chat(this.gameId, 'player', 'Who would you like to play?');
      this.api.chat(this.gameId, 'spectator', 'Waiting for opponent selection');
      // clear this for next if
      chatPlayer = ''
    } 


    // No player found in chat setting wizPlayer, still waiting to be told who to play as
    if (chatPlayer === '') {
      console.log(chalk.red(`No player found for game ${this.gameId}`))
      // probably not necessary but just for safety go ahead and set wizPlayer to empty string
      this.wizPlayer = ''
      return 
    } 
    
    // if gauntlet passed, a player was found in the chat
    this.wizPlayer = chatPlayer
    console.log(chalk.magenta(`Playing ${this.gameId} as ${this.wizPlayer}`))
  }

  setWizPlayer(wizPlayer) {
    this.wizPlayer = wizPlayer
    this.api.chat(this.gameId, 'player', `Playing as ${wizPlayer}`);
    this.api.chat(this.gameId, 'spectator', `Playing as ${wizPlayer}`);
    // this.playNextMove(this.previousMoves)
  }

  // Check the spectator chat (via HTML page) for a Wiz Player setting
  async getWizPlayerFromChat() {
    const gamePage = await this.api.gamePage(this.gameId)
    
    // caputre and count message, if no messages have been sent respond with string
    // to let the system know it should ask who the wants to play
    const wizMessagesRx = /"u":"yeoldwiz","t":".*?"/g
    const wizMessages = gamePage.data.match(wizMessagesRx) || []
    if (wizMessages.length === 0) {
      return 'should ask who to play'
    }
    
    // Next we check for a "Playing as string" if one exist we will capture it
    // and try to parse out the opponent name and return it
    const playingAsRx = /"u":"yeoldwiz","t":"Playing as [A-Za-z0-9\.]*/g
    const opponentData = gamePage.data.match(playingAsRx)
    let opponent = ''
    if (opponentData == null) {
      return ''
    }
    opponent = opponentData[0].replace('"u":"yeoldwiz","t":"Playing as ', '')
    return opponent
  }


  async handler(event) {
    // console.log(chalk.yellow(event.type))
    switch (event.type) {
      case "chatLine":
        this.handleChatLine(event);
        break;
      case "gameFull":
        // console.log(event)
        this.colour = this.playingAs(event);
        // If this is a rated game use the standar personality for now
        // if (event.rated && !this.wizPlayer) this.setWizPlayer('JW7')
        this.rated = event.rated
        await this.findAndSetWizPlayer()
        this.playNextMove(event.state.moves);
        break;
      case "gameState":
        this.playNextMove(event.moves);
        break;
      default:
        console.log("Unhandled game event : " + JSON.stringify(event));
    }
  }

  async playNextMove(previousMoves) {
    // cache the moves if we end up not moving right due to missing Wiz Player
    this.previousMoves = previousMoves
    
    
    const moves = (previousMoves === "") ? [] : previousMoves.split(" ");
    if (this.isTurn(this.colour, moves)) {
      const nextMove = await this.player.getNextMove(moves, this.wizPlayer, this.gameId);
      if (nextMove) {
        console.log(this.name + " as " + this.colour + " to move " + nextMove);
        this.api.makeMove(this.gameId, nextMove);
      }
    }
  }

  playingAs(event) {
    return (event.white.name === this.name) ? "white" : "black";
  }

  isTurn(colour, moves) {
    var parity = moves.length % 2;
    return (colour === "white") ? (parity === 0) : (parity === 1);
  }
}

module.exports = Game;
