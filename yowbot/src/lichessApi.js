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
    console.log(chalk.magentaBright(`main event stream has closed`))
  })

  onErr = onErr || ((err) => {
    console.log(err)
  })
  const url = "api/stream/event"
  const { res, controller } = await stream(url, handler, onDone, onErr)

  if (!res.ok) {
    console.log(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
  }

  //  await new Promise(resolve => setTimeout(resolve, 5000))
  //  controller.abort()
  //  console.log('Aborted main events')
}

async function streamGame(gameId, handler, onDone) {
  const onErr = (err) => {
    console.log(err)
  }
  const url = `api/bot/game/stream/${gameId}`
  const { res, controller } = await stream(url, handler, onDone, onErr)

  if (!res.ok) {
    console.log(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
  }
}


async function stream(url, handler, onDone, onError) {
  const controller = new AbortController()
  const signal = controller.signal
  const res = await fetch(baseURL + url, { method: 'GET', headers, signal })

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
        console.log(chalk.red(`GET ${baseURL + url} stream`))
        console.error(JSON.stringify(err))
        onError(err)
        continue
      }
      handler(event)
    }
  })

  res.body.on('end', onDone)
  return { res, controller }
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
