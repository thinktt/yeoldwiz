
const chalk = require('chalk')
const personalites = require('./personalities')
const wiz = require('./wiz.js')
const api = require('./lichessApi.js')
const yowApi = require('./yowApi.js')

// A factory that creates a game object and it's interface functions
async function create(gameId) {

  const game = {
    handler,
    setupGame,
    handleGameState,
    handleChatLine,
    findAndSetWizPlayer,
    sayWizPlayer,
    setWizPlayer,
    getWizPlayerFromChat,
    playNextMove,
    playingAs,
    sendWizPlayerToYowApi,
    id: gameId,
    willAcceptDraw : false,
    isMoving : false,
    isAcceptingDraws : false,
    hasDrawOffer : false,
    isOver: false, 
    streamIsClosed: false,
    previousMoves : '',
    isInChallengMode: process.env.IN_CHALLENGE_MODE,
    challengeWizPlayer: process.env.CHALLENGE_MODE_WIZ_PLAYER,
    lichessBotName : process.env.LICHESS_BOT_NAME,
    ratedWizPlayer : process.env.RATED_WIZ_PLAYER,
    lichessOpponent: '',
    streamController: null,
    // if system restarts drawShouldWaitForMove is used to make sure  we don't
    // decline a draw when system doesn't know if it should draw or not yet
    drawShouldWaitForMove: true,
  }



  // turn on the stream via the lichess API, end callback is onClose callback
  game.streamController = await api.streamGame(gameId, game.handler, () => {
    console.log(chalk.magentaBright(`game stream for ${gameId} has closed`))
    game.streamIsClosed = true
  })

  // Below game object functions exposed above
  async function handler(event) {
    logger(chalk.yellow(`event: ${event.type} `), true)    
    
    switch (event.type) {
      case "chatLine":
        logger(chalk.yellow(``))
        game.handleChatLine(event)
        break;
      case "gameFull":
        logger(chalk.yellow(``))
        await game.setupGame(event)
        game.handleGameState(event.state)
        break;
        case "gameState":
        logger(chalk.yellow(`${event.moves?.split(' ').length} moves`))
        game.handleGameState(event)
        break;
      case "opponentGone":
        logger(chalk.yellow(`${event.gone}`))
        break;
      default:
        logger(chalk.yellow(`unhandled`))
    }
  }

  function onDone() {

  }
  
  let selfGame = 0
  async function setupGame(event) {
    game.color = game.playingAs(event)
    game.rated = event.rated
    game.lichessOpponent = getLichessOpponent(event, game.color)  
    await game.findAndSetWizPlayer()
    
    if (event.state.bdraw || event.state.wdraw) {
      logger('A draw was requested')
      game.hasDrawOffer = true
    }

    if (game.isInChallengMode) {
      logger(`challenge mode is on and challenge player is ${game.challengeWizPlayer}`)
      // wait a while then tell the other bot who to play as
      await new Promise(r => setTimeout(r, 3000))
      game.sayWizPlayer()
    }
  }

  function getLichessOpponent(event, color) {
    let opponentColor
    if (color === 'white') opponentColor = 'black'
      else opponentColor = 'white'
    return event[opponentColor].id
  }

  async function handleGameState(gameState) {
    const endStatuses = [ "mate", "resign", "stalemate", "timeout", "draw", "outoftime" ]

    if (endStatuses.includes(gameState.status)) {
      logger(chalk.greenBright(`Game ${game.id} has ended with a ${gameState.status}`))
      if (game.lichessOpponent === 'yeoldwiz' && game.isInChallengMode === 'true') {
        sendWizChallenge()
      }
      game.isOver = true
      return
    }

    if(!game.isMoving) {
      game.isMoving = true
      let err = null 
      await game.playNextMove(gameState).catch(e => err = e)
      // if playing the next move broke let's try to restart game stream to reset things
      if (err && !game.isOver) {
        console.error(chalk.red(`Failed to make move for ${game.id}, restarting stream`))
        game.streamController.abort('forReset')
      }
      game.isMoving = false
    }
  }

  async function sendWizChallenge() {
    logger('Starting a new challenge in a few seconds')
    await new Promise(r => setTimeout(r, 5000))
    await api.challenge('yeoldwiz')
  } 

  async function handleChatLine(event) {
    // check if a draw was offered
    if (event.username === 'lichess' && event.room === 'player' && 
      event.text.includes('offers draw')) {

        logger('A draw was requested')
        game.hasDrawOffer = true
    
        if (game.hasDrawOffer && game.willAcceptDraw && !game.isMoving)  {
          api.acceptDraw(game.id)
          return
        }

        if (game.hasDrawOffer && !game.willAcceptDraw && !game.isMoving 
          && !game.drawShouldWaitForMove)  {
            api.declineDraw(game.id)
            return
        }
    } 

    // check if a draw was declined
    if (event.username === 'lichess' && event.room === 'player'  &&
      event.text.includes('declines draw')) {
        logger('Draw was declined')
        game.hasDrawOffer = false
    }

    // check if an opponent was requested
    if (event.username !== game.lichessBotName) {
      const message = event.text.toLowerCase()
      if (game.wizPlayer == '') {
        const cmp = personalites.fuzzySearch(message)
        if ( !cmp ) {
          api.chat(game.id, 'player', "Sorry, I don't know that opponent");
          return
        }

        const wizPlayer = personalites.getProperName(cmp.name)
        game.setWizPlayer(wizPlayer)
        game.sayWizPlayer()
        game.sendWizPlayerToYowApi()
        
        let err = null
        await game.playNextMove().catch(e => err = e)
        if (err && !game.isOver) {
          console.error(chalk.red(`Failed to make move for ${game.id}, restarting stream`))
          game.streamController.abort('forReset')
        }
        
      }
    }
  }

  async function sendWizPlayerToYowApi() {
    const yowBotNames = ['yeoldwiz', 'yowcapablanca']
    const user = game.lichessOpponent
    const id = game.id
    const opponent = game.wizPlayer
    
    // add the wiz player to the db but skip if playing is a yowbot
    if (user && id && opponent && !yowBotNames.includes(user)) {
      const yowGame = {user, id, opponent}
      const { err } = await yowApi.addGame(yowGame)
    }
  }

  async function findAndSetWizPlayer() {
    // check yowApi for a player
    const { yowGame } = await yowApi.getGame(game.id)
    const yowWizPlayer = yowGame?.opponent
        
    // search chat for a player
    const { chatPlayer, chatIsEmpty } = await game.getWizPlayerFromChat()
    
    // check if this is a rated game if it is set a ratedWizPlayer
    let ratedWizPlayer = null
    if (game.rated) ratedWizPlayer = game.ratedWizPlayer

    // this is a way for dev to play against prod for testing
    let challengeWizPlayer = null
    if (game.isInChallengMode && game.lichessOpponent === 'yeoldwiz') {
      challengeWizPlayer = game.challengeWizPlayer
    }

    // order of operations for all the ways to find the wizPlayer
    const wizPlayer = yowWizPlayer ||  ratedWizPlayer ||  chatPlayer || challengeWizPlayer

    if (wizPlayer) {
      game.setWizPlayer(wizPlayer)
      // if we're in challenge mode don't send anything to chat as we can confuse 
      // the other bot, instead we'll do it a few seconds after game starts
      if (chatIsEmpty && !game.isInChallengMode) game.sayWizPlayer()
      if (!yowWizPlayer) game.sendWizPlayerToYowApi()
      return 
    }

    // no wiz player was found
    if (chatIsEmpty) askWhoToPlay()
    logger(chalk.red(`No player found for game ${game.id}`))
    // probably not necessary but just to be safe
    game.wizPlayer = ''
  }

  function askWhoToPlay() {
    api.chat(game.id, 'player', 
      'Who would you like to play? Give me a name or a rating number from 1 to 2750.')
    api.chat(game.id, 'spectator', 'Waiting for opponent selection');
  }

  function setWizPlayer(wizPlayer) {
    game.wizPlayer = wizPlayer
    logger(chalk.magenta(`Playing ${game.id} as ${game.wizPlayer}`))
  }

  function sayWizPlayer() {
    const cmp = personalites.fuzzySearch(game.wizPlayer)
    api.chat(game.id, 'player', 
      `Playing as ${game.wizPlayer}. Wiz Rating ${cmp.rating}. ${cmp.summary}`)
    api.chat(game.id, 'spectator', `Playing as ${game.wizPlayer}`)
  }

  async function getWizPlayerFromChat() {
    const {data: chatLines } = await api.getChat(game.id)
    // handle response errors
    
    // chat is empty right now
    const wizMessages = chatLines.filter(line => line.user === game.lichessBotName)
    if (wizMessages.length === 0) return {chatPlayer : '', chatIsEmpty: true}

    // no opponent set in chat yet
    const playAsMessages = wizMessages.filter(line => line.text.includes('Playing as'))
    if (playAsMessages.length === 0) return {chatPlayer : '', chatIsEmpty: false}

    const chatPlayer = 
      playAsMessages[0].text.match(/Playing as [A-Za-z0-9]*/)[0].replace('Playing as ', '')

    return { chatPlayer, chatIsEmpty: false }
  }

  async function playNextMove(gameState) {
    // cache the moves if we end up not moving right due to missing Wiz Player
    if (gameState) game.previousMoves = gameState.moves
    const previousMoves = game.previousMoves

    // if we are still under 15 moves (30 half moves) any draws can be immediately accepted
    if (previousMoves.length <= 30) game.drawShouldWaitForMove = false
    
    const moves = (previousMoves === "") ? [] : previousMoves.split(" ")

    // if it's not the bots turn then exit
    if (!isTurn(game.color, moves)) return

    const moveData = await wiz.getNextMove(moves, game.wizPlayer, game.id)
    
    // no move was found or move setup was invalid, go about your business
    if (!moveData) return 
    
    if (game.isOver) {
      logger(chalk.yellow('move received but game is over'))
      return
    }  

    const { move, willAcceptDraw } = moveData
    game.willAcceptDraw = willAcceptDraw
    game.drawShouldWaitForMove = false
    
    
    if (game.hasDrawOffer && game.willAcceptDraw)  {
      // this will keep susequent events from triggering draw request
      game.willAcceptDraw=false
      await api.acceptDraw(game.id)
      return
    }

    // logger(game.lichessBotName + " as " + game.color + " to move " + move)
    await api.makeMove(game.id, move)
  }

  function playingAs(event) {
    return (event.white.name === game.lichessBotName) ? "white" : "black"
  }

  function logger(data, notEndOfLine) {
    process.stdout.write(data)
    if (notEndOfLine) return 
    
    if(game.id && !data.includes(game.id)) { 
      process.stdout.write(chalk.green(' ' + game.id + '\n'))
    } else {
      process.stdout.write('\n')
    }
  }

  return game
}


// given a color and a list of move determine if it's this colors move
function isTurn(color, moves) {
  var parity = moves.length % 2;
  return (color === "white") ? (parity === 0) : (parity === 1);
}


module.exports = {
  create,
}
