const axios = require("axios")
const fetch = require('node-fetch')
const chalk = require('chalk')
let token = process.env.API_TOKEN

const baseURL = "https://lichess.org/"
const headers = { "Authorization": `Bearer ${token}` }
const axiosConfig = { baseURL, headers }

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
  // test move failure
  // if (failTime === 2) move = move + '/gagalunk'
  // failTime++

  return post(`api/bot/game/${gameId}/move/${move}`, null, (err) => {
    throw err
  })
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

function post(URL, body, onErr) {
  console.log(`POST ${URL} ` + JSON.stringify(body || {}))
  return axios.post(URL, body || {}, axiosConfig).catch((err) => {
    console.error(chalk.red(`POST ${URL} ${err.message}`))
    if (onErr) onErr(err)
  })
}

async function streamEvents(handler, onDone, onErr) {
  onDone = onDone || (() => {
    console.error(chalk.magentaBright(`main event stream has closed`))
  })
  
  const url = "api/stream/event"
  console.log(`GET ${url}`)
  const { res, restart } = await stream(url, handler, onDone, onErr)

  if (!res.ok) {
    console.error(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
  }

  return {res, restart}
}

async function streamGame(gameId, handler, onDone, onErr) {
  let gameIsClosed = false
 
  onErr = onErr ||  ((err) => {
    console.error(chalk.red(`Stream error: ${err.message || err}`))
  })
   
  const url = `api/bot/game/stream/${gameId}`
  console.log(`GET ${url}`)
  const streamObj = await stream(url, handler, onDone, onErr)

  const res = streamObj.res
  if (!res.ok) {
    console.error(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
  }
  
  return streamObj
}


const reqQue = []
let queIsRunning = false
function queReq(url, signal) {
  let resolve
  let reject
  const reqPromise = new Promise((r, x) => {
    resolve = r
    reject = x
  })
  reqQue.push({ url, signal, resolve, reject })
  startQue()
  return reqPromise
}

async function startQue() {
  if (queIsRunning) return
  queIsRunning = true
  while (reqQue.length) {
    const { url, signal, resolve, reject } = reqQue.pop()
    let err
    const res = await fetch(baseURL + url, { method: 'GET', headers, signal }).catch(e => err = e)
    await new Promise(r => setTimeout(r, 300))
    if (err) {
      reject(err)
    }
    resolve(res) 
  }
  queIsRunning = false
}


async function stream(url, handler, onDone) {
  const controller = new AbortController()
  const signal = controller.signal
  let lastStreamPing
  let streamIsOpen = true
  const res = await queReq(url, signal) //fetch(baseURL + url, { method: 'GET', headers, signal })

  const restart = async () => restartStream(url, handler, onDone, onErr)

  const onErr = async (err) => {
    console.error(chalk.red(`${url} stream error: ${err}`))
    streamIsOpen = false
    
    if (!controller.signal.aborted) {
      console.error(chalk.red(`${url} aborting stream`))
      controller.abort()
      return 
    }
    await restart() // restartStream(url, handler, onDone, onErr)
  }

  if (!res.ok) {
    console.log(res.status)
    restart() // restartStream(url, handler, onDone, onErr)
    return { res, restart }
  }

  const watchForIdleStream = async () => {
    while(streamIsOpen) {
      const streamPingGap = Date.now() - lastStreamPing || 0
      // console.log(url, streamPingGap)
      if (streamPingGap > 6500) {
        console.log(chalk.magenta(url, ' stream is idle, restarting'))
        restart() // restartStream(url, handler, onDone, onErr)
        break
      }
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  const decoder = new TextDecoder()
  let buf = ''
  res.body.on('data', (data) => {
    lastStreamPing = Date.now()
    const chunk = decoder.decode(data, { stream: true })
    buf += chunk
    let parts = buf.split(/\r?\n/)
    buf = parts.pop() 
    for (const part of parts) {
      if (!part) continue
      let event
      try {
        event = JSON.parse(part)
      } catch (err) {
        const jsonErr = `JSON error parsing ${part}`
        console.log(res)
        onErr(jsonErr)
        continue
      }
      handler(event)
    }
  })

  res.body.on('error', onErr)
  res.body.on('end', () => {
    streamIsOpen = false
    onDone()
  })

  // test the stream faillure by aborting the stream
  // if (url.includes('i2XAu64t')) {
  //   console.log(chalk.blue('testing lost stream'))
  //   // testStreamFailure(controller, 20000)
  //   restart()
  // }
  
  watchForIdleStream()

  return { res, restart }
}

async function testStreamFailure(controller, failTime ) {
  await new Promise(r => setTimeout(r, failTime))
  console.log(chalk.green('Testing failure, aborting a stream'))
  controller.abort()
}

// let backoff = 1000
// let lastFailureTime = Date.now()
const backoffMap = {}
const backoffThreshold = 60 * 1000
const maxBackoff = 10 * 60 * 1000
async function restartStream(url, handler, onDone, onErr) {
  backoffMap[url] = backoffMap[url] || { lastFailureTime: Date.now(), backoff: 1000 }
  const failureInterval = Date.now() - backoffMap[url].lastFailureTime

  // if it's been a long time since the last error reset the backoff
  if (failureInterval > backoffThreshold) backoffMap[url].backoff = 1000
  backoffMap[url].lastFailureTime = Date.now()
  
  console.error(chalk.magentaBright(`restarting ${url} stream in ${backoffMap[url].backoff/1000} seconds`))
  await new Promise(r => setTimeout(r, backoffMap[url].backoff))

  // increase the backoff for the next restart up to the max backoff
  backoffMap[url].backoff = backoffMap[url].backoff * 2
  if (backoffMap[url].backoff > maxBackoff) backoffMap[url].backoff = maxBackoff

  let err
  const { res } = await stream(url, handler, onDone, onErr).catch(e => err = e)
  if (err) {
    console.error(chalk.red(`GET ${url} stream ${err.code}`))
    restartStream(url, handler, onDone, onErr)
    return
  }
  if (!res.ok) {
    console.error(chalk.red(`GET ${url} stream ${res.status}  ${res.statusText}`))
    restartStream(url, handler, onDone, onErr)
  }
}
