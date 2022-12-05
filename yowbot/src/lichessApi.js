const axios = require("axios")
const fetch = require('node-fetch')
const chalk = require('chalk')
let token = process.env.API_TOKEN

const baseURL = "https://lichess.org/"
const headers = { "Authorization": `Bearer ${token}` }
const axiosConfig = { baseURL, headers }


function setToken(tokenToSet) {
  token = tokenToSet
}

function challenge(username) {
  return post(`api/challenge/${username}`)
}

function acceptChallenge(challengeId) {
  return post(`api/challenge/${challengeId}/accept`)
}

function declineChallenge(challengeId, reason) {
  return post(`api/challenge/${challengeId}/decline`, { reason })
}

function upgrade() {
  return post("api/bot/accounts/upgrade")
}

function accountInfo() {
  return get("api/account")
}

function makeMove(gameId, move) {
  return post(`api/bot/game/${gameId}/move/${move}`)
}

function acceptDraw(gameId) {
  return post(`api/bot/game/${gameId}/draw/yes`)
}

function declineDraw(gameId) {
  return post(`api/bot/game/${gameId}/draw/no`)
}

function abortGame(gameId) {
  return post(`api/bot/game/${gameId}/abort`)
}

function resignGame(gameId) {
  return post(`api/bot/game/${gameId}/resign`)
}

function chat(gameId, room, text) {
  return post(`api/bot/game/${gameId}/chat`, {
    room,
    text
  })
}

function getChat(gameId) {
  return get(`api/bot/game/${gameId}/chat`)
}

function currentGames() {
  return get('https://lichess.org/api/account/playing')
}

function logAndReturn(data) {
  // console.log(JSON.stringify(data.data))
  // console.log(data)
  return data
}

// Get the full public game page, useful for parsing info regular api 
// doesn't have
function gamePage(gameId) {
  return get(`https://lichess.org/${gameId}`)
}


function get(URL) {
  // temporary hack to supress health check logging
  // if (URL != 'https://lichess.org/api/account/playing') console.log(`GET ${URL}`)
  // URL = URL + '/fail'
  console.log(`GET ${URL}`)
  return  axios.get(URL + "?v=" + Date.now(), axiosConfig).catch((err) => {
    console.error(chalk.red(`GET ${URL}  ${err.message}`))
  })
}

function post(URL, body) {
  console.log(`POST ${URL} ` + JSON.stringify(body || {}))
  return axios.post(URL, body || {}, axiosConfig).catch((err) => {
    console.error(chalk.red(`POST ${URL} ${err.message}`))
  })
}

async function streamEvents(handler, onDone, onErr) {
  onDone = onDone || (() => {
    console.error(chalk.magentaBright(`main event stream has closed`))
  })
  
  const url = "api/stream/event"
  console.log(`GET ${url}`)
  const { res, controller } = await stream(url, handler, onDone, onErr)

  if (!res.ok) {
    console.error(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
  }

  return {res, controller}
}

async function streamGame(gameId, handler, onDone, onErr) {
  onErr = onErr ||  ((err) => {
    console.error(chalk.red(`Stream error: ${err.message || err}`))
  })
   
  const url = `api/bot/game/stream/${gameId}`
  console.log(`GET ${url}`)
  const { res, controller } = await stream(url, handler, onDone, onErr)

  if (!res.ok) {
    console.error(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
  }
 
  return controller
}


async function stream(url, handler, onDone) {
  const controller = new AbortController()
  const signal = controller.signal
  const res = await fetch(baseURL + url, { method: 'GET', headers, signal })

  const onErr = (err) => {
    if (err.type === 'aborted') {
      console.error(chalk.magentaBright(`${url} event stream has been aborted`)) 
      // return 
    } 
    console.error(chalk.red(`${url} stream error: ${err}`))
    console.error(chalk.magentaBright(`stopping ${url} stream and restarting`)) 
    controller.abort()
    restartStream(url, handler, onDone, onErr)
  }

  const decoder = new TextDecoder()
  let buf = ''
  res.body.on('data', (data) => {
    const chunk = decoder.decode(data, { stream: true })
    buf += chunk
    const parts = buf.split(/\r?\n/)
    buf = parts.pop()

    for (const part of parts) {
      if (!part) continue
      let event
      try {
        event = JSON.parse(part)
      } catch (err) {
        const jsonErr = `JSON error ${err}`
        onErr(jsonErr)
        continue
      }
      handler(event)
    }
  })

  res.body.on('error', onErr)
  res.body.on('end', onDone)

  // test the stream faillure by aborting the stream
  // if (url.includes('event')) {
  //   testStreamFailure(controller, 5000)
  // }
  
  return { res, controller }
}

async function testStreamFailure(controller, failTime ) {
  console.log(chalk.green('Testing failure, aborting a stream'))
  await new Promise(r => setTimeout(r, failTime))
  controller.abort()
}

let backoff = 5000
let lastFailureTime = Date.now()
async function restartStream(url, handler, onDone, onErr) {
  console.error(chalk.magentaBright(`restarting ${url} stream in ${backoff/1000} seconds`))

  const backoffThreshold = 60 * 1000
  const maxBackoff = 10 * 60 * 1000
  const failureInterval = Date.now() - lastFailureTime
  await new Promise(r => setTimeout(r, backoff))
  
  // if it's been a long time since the last error reset the backoff
  if (failureInterval > backoffThreshold) {
     backoff = 5000
  } else {
     backoff = backoff * 2  
  }
  if (backoff > maxBackoff) backoff = maxBackoff
  lastFailureTime = Date.now()

  stream(url, handler, onDone, onErr)
}


module.exports = {
  setToken,
  challenge,
  acceptChallenge,
  declineChallenge,
  upgrade,
  accountInfo,
  makeMove,
  acceptDraw,
  declineDraw,
  abortGame,
  resignGame,
  streamEvents,
  streamGame,
  chat,
  getChat,
  currentGames,
  logAndReturn,
  gamePage,
  get,
  post,
  stream,
}
