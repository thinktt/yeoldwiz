
const chalk = require('chalk')
const personalites = require('./personalities')
const wiz = require('./wiz.js')
const api = require('./lichessApi.js')


// A factory that creates a game object and it's interface functions
function create(gameId) {

  const game = {
    handler,
    setupGame,
    handleGameState,
    handleChatLine,
    findAndSetWizPlayer,
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
    // if system restarts drawShouldWaitForMove is used to make sure  we don't
    // decline a draw when system doesn't know if it should draw or not yet
    drawShouldWaitForMove: true,
  }

  // turn on the stream via the lichess API
  api.streamGame(gameId, (event) => game.handler(event))

  // Below game object functions exposed above

  async function handler(event) {
    console.log(chalk.yellow('event: ' + event.type))
    switch (event.type) {
      case "chatLine":
        game.handleChatLine(event)
        break;
      case "gameFull":
        // console.log(event)
        await game.setupGame(event)
        game.handleGameState(event.state)
        break;
      case "gameState":
        // console.log(event)
        game.handleGameState(event)
        break;
      default:
        console.log("Unhandled game event : " + JSON.stringify(event));
    }
  }

  async function setupGame(event) {
    game.color = game.playingAs(event)
    game.rated = event.rated
    game.lichessOpponent = getLichessOpponent(event, game.color)  

    if (game.lichessOpponent === 'yeoldwiz' &&  !game.wizPlayer) {
      await new Promise(r => setTimeout(r, 4000))
      api.chat(game.gameId, 'player', 'Joey')
    }

    if (event.state.bdraw || event.state.wdraw) {
      console.log('A draw was requested')
      game.hasDrawOffer = true
    }
    await game.findAndSetWizPlayer()
  }

 

  function getLichessOpponent(event, color) {
    let opponentColor
    if (color === 'white') opponentColor = 'black'
      else opponentColor = 'white'
    return event[opponentColor].id
  }

  async function handleGameState(gameState) {
    const endStatuses = [ "mate", "resign", "stalemate", "timeout", "draw", "outoftime" ]
    if (endStatuses.includes(gameState.status) && game.lichessOpponent === 'yeoldwiz') {
      console.log('Starting a new challenge')
      await api.challenge('yeoldwiz')
    }

    if (gameState.status === 'draw') return

    if(!game.isMoving) {
      game.isMoving = true
      await game.playNextMove(gameState)
      game.isMoving = false
    }
  }

  function handleChatLine(event) {
    if (event.username === 'lichess' && event.room === 'player' && 
        event.text.includes('offers draw')
    ) {
        console.log('A draw was requested')
        game.hasDrawOffer = true
    
        if (game.hasDrawOffer && game.willAcceptDraw && !game.isMoving)  {
          api.acceptDraw(game.gameId)
          return
        }

        if (game.hasDrawOffer && !game.willAcceptDraw && !game.isMoving 
          && !game.drawShouldWaitForMove
        )  {
          api.declineDraw(game.gameId)
          return
        }
    }

    if (event.username === 'lichess' && event.room === 'player'  &&
        event.text.includes('declines draw')
    ) {
      console.log('Draw was declined')
      game.hasDrawOffer = false
    }

    if (event.username !== game.lichessBotName) {
      const message = event.text.toLowerCase()
      if (game.wizPlayer == '') {
        const cmp = personalites.fuzzySearch(message)
        if ( !cmp ) {
          // api.chat(game.gameId, 'player', "Sorry, I don't know that opponent");
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
    let chatPlayer = await game.getWizPlayerFromChat()
    
    // If no opponent has been set in chat and this is a rated game set
    // the game to play as the default Wiz Player
    if ((chatPlayer === '' || chatPlayer === 'should ask who to play') &&  game.rated) {
      game.setWizPlayer(game.ratedWizPlayer)
      return
    }


    
    // This means chat has no messages at all so we should ask who the player wants to play
    if (chatPlayer === 'should ask who to play' && !game.rated) {
      // api.chat(
      //   game.gameId, 
      //   // 'player', 'Who would you like to play? Give me a name or a rating number from 1 to 2750.'
      // );
      api.chat(game.gameId, 'spectator', 'Waiting for opponent selection');
      // clear this for next if
      chatPlayer = ''
    } 


    // No player found in chat setting wizPlayer, still waiting to be told who to play as
    if (chatPlayer === '') {
      console.log(chalk.red(`No player found for game ${game.gameId}`))
      // probably not necessary but just for safety go ahead and set wizPlayer to empty string
      game.wizPlayer = ''
      return 
    } 
    
    // if gauntlet passed, a player was found in the chat
    game.wizPlayer = chatPlayer
    console.log(chalk.magenta(`Playing ${game.gameId} as ${game.wizPlayer}`))
  }

  function setWizPlayer(wizPlayer) {
    game.wizPlayer = wizPlayer
    api.chat(game.gameId, 'player', `Playing as ${wizPlayer}`);
    api.chat(game.gameId, 'spectator', `Playing as ${wizPlayer}`);
    // game.playNextMove(game.previousMoves)
  }

  async function getWizPlayerFromChat() {
    const {data: chatLines } = await api.getChat(game.gameId)
    // handle response errors

    // we need to ask them who they wan to play
    const wizMessages = chatLines.filter(line => line.user === game.lichessBotName)
    if (wizMessages.length === 0) return 'should ask who to play'

    // no opponent set in chat yet
    const playAsMessages = wizMessages.filter(line => line.text.includes('Playing as'))
    if (playAsMessages.length === 0) return ''

    const opponent = 
      playAsMessages[0].text.match(/Playing as [A-Za-z0-9]*/)[0].replace('Playing as ', '')

    return opponent
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


    console.log(game.lichessBotName + " as " + game.color + " to move " + move);
    await api.makeMove(game.gameId, move)
  }

  function playingAs(event) {
    return (event.white.name === game.lichessBotName) ? "white" : "black";
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
