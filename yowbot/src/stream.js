const fetch = require('node-fetch')


const readStream = processLine => response => {
  const matcher = /\r?\n/
  const decoder = new TextDecoder()
  let buf = ''
  return new Promise((resolve, fail) => {
  
    response.body.on('data', v => {
      const chunk = decoder.decode(v, { stream: true })
      buf += chunk

      const parts = buf.split(matcher)
      buf = parts.pop()
      for (const i of parts.filter(p => p)) processLine(JSON.parse(i))
    })

    response.body.on('end', () => {
      if (buf.length > 0) processLine(JSON.parse(buf))
      resolve()
    })

    response.body.on('error', fail)
  
  })
}

test()

async function test() {
  let err = null
  const data = await testAsyncErr().catch(e => err = e)
  if (err) {
    console.log(err.message)
    return
  }
  console.log(data)
}

async function testAsyncErr() {
  // return 'Howdy'
  // throw new Error("Let's blow up this taco stand!")
  JSON.parse('😈')
}

async function errFortify(funcToFortify) {
  let data
  try {
    data = await funcToFortify()
  } catch (err) {
    return {err, data} 
  }
  return { data } 
}



async function stream(url, handler) {
  const controller = new AbortController()
  const signal = controller.signal
  const res = await fetch(url, { signal })
  
  const decoder = new TextDecoder()
  let buf = ''

  res.body.on('data', (data) => {
    const chunk = decoder.decode(data, { stream: true })
    buf += chunk
    const parts = buf.split(/\r?\n/)
    buf = parts.pop()

    for (const part of parts) {
      const event = JSON.parse(part)
      handler(event)
    }
  })

  res.body.on('end', () => {
    console.log('done')
  })

  return controller
  // await new Promise(resolve => setTimeout(resolve, 15000))
  // controller.abort()
}




// or any other ND-JSON endpoint such as:
// const stream = fetch('https://lichess.org/api/games/user/neio',{headers:{Accept:'application/x-ndjson'}})

// const onMessage = obj => console.log(obj)
// const onComplete = () => console.log('The stream has completed')

// stream
//   .then(readStream(onMessage))
//   .then(onComplete)