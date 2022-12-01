
const chalk = require('chalk')
const personalites = require('./personalities')
const wiz = require('./wiz.js')
const api = require('./lichessApi.js')
const yowApi = require('./yowApi.js')

// A factory that creates a game object and it's interface functions
function create(gameId) {

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
    gameId,
    willAcceptDraw : false,
    isMoving : false,
    isAcceptingDraws : false,
    hasDrawOffer : false,
    previousMoves : '',
    lichessBotName : process.env.LICHESS_BOT_NAME,
    ratedWizPlayer : process.env.RATED_WIZ_PLAYER,
    lichessOpponent: '',
    // if system restarts drawShouldWaitForMove is used to make sure  we don't
    // decline a draw when system doesn't know if it should draw or not yet
    drawShouldWaitForMove: true,
  }

  // turn on the stream via the lichess API
  api.streamGame(gameId, (event) => game.handler(event))

  // Below game object functions exposed above
  async function handler(event) {
    logger(chalk.yellow(`event: ${event.type} `), true)    
    // if (event.type === 'gameState') {
    //   logger(chalk.yellow(`event: ${event.type} ${event.moves?.split(' ').length} moves`))
    // } else logger(chalk.yellow(`event: ${event.type}`))
    
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
        logger(chalk.yellow(``))
        break;
      default:
        logger(chalk.yellow(`unhandled`))
    }
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
  }

  function getLichessOpponent(event, color) {
    let opponentColor
    if (color === 'white') opponentColor = 'black'
      else opponentColor = 'white'
    return event[opponentColor].id
  }

  async function handleGameState(gameState) {
    const endStatuses = [ "mate", "resign", "stalemate", "timeout", "draw", "outoftime" ]
    if (endStatuses.includes(gameState.status) && game.lichessOpponent === 'yeoldwiz' &&
      process.env.IN_CHALLENGE_MODE === 'true') {
        logger('Starting a new challenge')
        await api.challenge('yeoldwiz')
    }

    if (endStatuses.includes(game.status)) {
      logger(chalk.greenBright(`Game ${game.id} has ended with a ${game.status}`))
      return
    }

    if(!game.isMoving) {
      game.isMoving = true
      await game.playNextMove(gameState)
      game.isMoving = false
    }
  }

  function handleChatLine(event) {
    if (event.username === 'lichess' && event.room === 'player' && 
      event.text.includes('offers draw')) {

        logger('A draw was requested')
        game.hasDrawOffer = true
    
        if (game.hasDrawOffer && game.willAcceptDraw && !game.isMoving)  {
          api.acceptDraw(game.gameId)
          return
        }

        if (game.hasDrawOffer && !game.willAcceptDraw && !game.isMoving 
          && !game.drawShouldWaitForMove)  {
            api.declineDraw(game.gameId)
            return
        }
    } 

    if (event.username === 'lichess' && event.room === 'player'  &&
      event.text.includes('declines draw')) {
        logger('Draw was declined')
        game.hasDrawOffer = false
    }

    if (event.username !== game.lichessBotName) {
      const message = event.text.toLowerCase()
      if (game.wizPlayer == '') {
        const cmp = personalites.fuzzySearch(message)
        if ( !cmp ) {
          api.chat(game.gameId, 'player', "Sorry, I don't know that opponent");
          return
        }

        game.wizPlayer = personalites.getProperName(cmp.name)
        api.chat(game.gameId,'player', 
          `Playing as ${game.wizPlayer}. Wiz Rating ${cmp.rating}. ${cmp.summary}`
        );
        api.chat(game.gameId, 'spectator', `Playing as ${game.wizPlayer}`);

        game.playNextMove()
      }
    }
  }

  async function findAndSetWizPlayer() {

    // check yowApi for a player
    let { yowGame } = await yowApi.getGame(game.gameId)
        
    // search chat for a player
    let { chatPlayer, chatIsEmpty } = await game.getWizPlayerFromChat()
    
    // make sure rated games always play with the rated wiz player
    if (game.rated) {
      game.setWizPlayer(game.ratedWizPlayer)
      if (chatIsEmpty) sayWizPlayer()
      return 
    }

    // we have a game from the yowApi but no chat player set the chat player
    if (yowGame && !chatPlayer) {
      game.setWizPlayer(yowGame.opponent)
      if (chatIsEmpty) sayWizPlayer()
      return
    }

    // let's add the wiz player ot the db but skip it we're playing a yowbot 
    const yowBotNames = ['yeoldwiz', 'yowCapablanca']
    if (!yowGame && !yowBotNames.includes(game.lichessOpponent) && chatPlayer) {
      const newYowGame = {user: game.lichessOpponent, id: game.gameId, opponent: chatPlayer}
      console.log(newYowGame)
      const { err } = await yowApi.addGame(newYowGame)
    }

    
    // if there is already a player in the chat then use as wiz player
    if (chatPlayer) {
      game.setWizPlayer(chatPlayer)
      return 
    }

    // no player in chat and lichess bot is in challenge mode, use the challenge player
    if (process.env.IN_CHALLENGE_MODE && game.lichessOpponent === 'yeoldwiz') {
      logger('In challenge mode against yeoldwiz, setting challenge opponent')
      game.setWizPlayer(process.env.CHALLENGE_MODE_WIZ_PLAYER)
      if (chatIsEmpty) sayWizPlayer()
      return
    }

    // No wiz player found and chat is empty, ask for opponent
    if (chatIsEmpty) {
      api.chat(
        game.gameId, 
        'player', 'Who would you like to play? Give me a name or a rating number from 1 to 2750.'
      );
      api.chat(game.gameId, 'spectator', 'Waiting for opponent selection');
    } 

    // No player found in chat, still waiting to be told who to play as
    logger(chalk.red(`No player found for game ${game.gameId}`))
    // probably not necessary but just for safety go ahead and set wizPlayer to empty string
    game.wizPlayer = ''
    return     
  }

  function setWizPlayer(wizPlayer) {
    game.wizPlayer = wizPlayer
    logger(chalk.magenta(`Playing ${game.gameId} as ${game.wizPlayer}`))
  }

  function sayWizPlayer() {
    const cmp = personalites.fuzzySearch(game.wizPlayer)
    api.chat(game.gameId, 'player', 
      `Playing as ${game.wizPlayer}. Wiz Rating ${cmp.rating}. ${cmp.summary}`)
    api.chat(game.gameId, 'spectator', `Playing as ${game.wizPlayer}`)
  }

  async function getWizPlayerFromChat() {
    const {data: chatLines } = await api.getChat(game.gameId)
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
    
    const moves = (previousMoves === "") ? [] : previousMoves.split(" ");

    // if it's not the bots turn then exit
    if (!isTurn(game.color, moves)) return

    const moveData = await wiz.getNextMove(moves, game.wizPlayer, game.gameId);
    
    // no move was found or move setup was invalid, go about your business
    if (!moveData) return 

    const { move, willAcceptDraw } = moveData
    game.willAcceptDraw = willAcceptDraw
    game.drawShouldWaitForMove = false
    
    
    if (game.hasDrawOffer && game.willAcceptDraw)  {
      // this will keep susequent events from triggering draw request
      game.willAcceptDraw=false
      await api.acceptDraw(game.gameId)
      return
    }


    // logger(game.lichessBotName + " as " + game.color + " to move " + move)
    await api.makeMove(game.gameId, move)
  }

  function playingAs(event) {
    return (event.white.name === game.lichessBotName) ? "white" : "black"
  }

  function logger(data, notEndOfLine) {
    process.stdout.write(data)
    if (notEndOfLine) return 
    
    if(game.gameId && !data.includes(game.gameId)) { 
      process.stdout.write(chalk.green(' ' + game.gameId + '\n'))
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
