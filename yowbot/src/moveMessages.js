const chalk = require('chalk')

module.exports = {
  pubMoveReq,
  getMove,
  init,
  close,
}


let moveStream
let nats 
let nc
let initIsDone = false


function close() {
  console.log('closing nats connection')
  if (nc) nc.close()
}


async function init() {
  if (initIsDone) return

  const natsToken = process.env.NATS_TOKEN
  let natsUrl = process.env.NATS_URL
  if (!natsToken) {
    console.error(chalk.red('NATS_TOKEN env variable not set'))
    process.exit(1)
  }
  if (!natsUrl) {
    natsUrl = 'localhost:4222'
    console.error(chalk.yellow(`NATS_URL not set, using default: ${natsUrl}`))
  } else {
    console.log(chalk.green(`NATS_URL: ${natsUrl}`))
  }

  nats = await import('nats')

  let err = null
  nc = await nats.connect({ servers: natsUrl, token: natsToken }).catch(e => err = e)
  if (err) {
    console.error(`error connecting to nats: ${err}`)
    process.exit(1)
  }

  console.log(`connected to move pub sub streams ${nc.getServer()}`)
  const done = nc.closed()
  const jsm = await nc.jetstreamManager()
  await jsm.streams.add({ name: 'move-req-stream', subjects: ['move-req'] })
  await jsm.streams.add({ name: 'move-res-stream', subjects: ['move-res.*'] })
  moveStream = nc.jetstream()
  // consider using some code to close nc when node exits
  initIsDone = true
}


async function getMove(settings) {
  // if (!initIsDone) await init()
  while (!initIsDone) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // change JW to Josh as yowking only knows Josh from personality.json
  // better solutions might be to just dump the JW alias but it's currently
  // littered throughout the system
  
  const { moves, cmpName, gameId, stopId, clockTime, randomIsOff, 
    shouldSkipBook } = settings
  
  let cmpRealName = cmpName
  if ( cmpName.includes('JW') ) cmpRealName = cmpName.replace('JW', 'Josh')
  
  const moveReq = { 
    moves, 
    cmpName: cmpRealName,
    gameId, 
    stopId, 
    clockTime,
    randomIsOff, 
    shouldSkipBook, 
  }

  // Publish move request
  await moveStream.publish('move-req', nats.StringCodec().encode(JSON.stringify(moveReq)))

  // Create the subscription to listen for move response for specific gameId
  // set max to 1 to auto unsubscribe after receiving 1 message
  const subject = `move-res.${gameId}`
  const subscription = nc.subscribe(subject, { max: 1 }) 

  // Wait for response, this seems conveluted to just get one message but at least
  // it's a short chucnk of code
  const moveRes = await new Promise((resolve) => {
    (async () => {
      for await (const m of subscription) {
        resolve(m.data) 
      }
    })().then()
  })
  
  // if moveRes doesn't parese error will throw automatically
  const moveData = JSON.parse(moveRes)

  // the engine workers rejected the move request
  if (moveData.err) {
    throw new Error(moveRes.err)
  }  

  return moveData
}

async function pubMoveReq(setitings) {
  const {gameId, cmpName, moves } = setitings
  const moveReq = {gameId, cmpName, moves}
  let err = null
  
  await moveStream.publish('move-req', nats.StringCodec()
    .encode(JSON.stringify(moveReq)))
    .catch(e => err = e)
  if (err) {
    console.error(`error publishing move-req: ${err}`)
  }
}