const fetch = require('node-fetch')
const chalk = require('chalk')

module.exports ={ 
  addGame,
  getGame,
}

// we'll use this to mark the api as down if we get a refused connection
// maybe not the best solution but will keep reques noise down if we 
// if yowApi is down for now
let yowApiIsDown = false
const apiIsDownRes = {ok: false, status: 502, message: 'yowApi is marked as down' }

// const yowApiUrl = '/fail'
// const yowApiUrl = 'http://localhost:5000'dock
// const yowApiUrl = 'https://www.google.com/gangalunnk'
const yowApiUrl = 'https://yeoldwiz.duckdns.org:64355'
const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/json'
}

async function addGame(game) {
  const url = `${yowApiUrl}/games/`
  console.log(`POST ${url}`, game)

  let err = null 
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(game)
  }).catch(e => err = e) 
  
  if (err) {
    console.log(chalk.red(`POST ${url} fetch failure:  ${err.message}`))
    return { err }
  }

  if (!res.ok) {
    console.log(chalk.red(`POST ${url} ${res.status} ${res.statusText}`))
    const err = new Error(res.status + ' ' + res.statusText)
    return { err }
  }

  return {}
} 


async function getGame(id) {
  const url = `${yowApiUrl}/games/${id}`
  console.log(`GET ${url}`)

  let err = null
  const res = await fetch(url, { headers }).catch(e => err = e)
  if (err) {
    yowApiIsDown = true
    console.log(chalk.red(`GET ${url} fetch failure: ${err.message}`))
    return { err }
  }

  if (!res.ok) {
    console.log(chalk.red(`GET ${url} ${res.status} ${res.statusText}`))
    const err = new Error(res.status + ' ' + res.statusText)
    return { err }
  }

  const yowGame = await res.json()

  return { yowGame }
}