
module.exports = {
  pubMoveReq,
}


init()
let moveStream
let nats 

async function init() {
  nats = await import('nats')
  const nc = await nats.connect({ servers: "localhost:4222" })
  console.log(`connected to move pub sub streams ${nc.getServer()}`)
  const done = nc.closed()
  const jsm = await nc.jetstreamManager()
  await jsm.streams.add({ name: 'move-req-stream', subjects: ['move-req'] })
  await jsm.streams.add({ name: 'move-res-stream', subjects: ['move-res'] })
  moveStream = nc.jetstream()

  // await nc.close()
  // const err = await done
  // if (err) {
  //   console.log(`error closing:`, err)
  // }
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