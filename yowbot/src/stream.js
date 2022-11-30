const fetch = require('node-fetch')


const readStream = processLine => response => {
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = '';
  return new Promise((resolve, fail) => {
  
    response.body.on('data', v => {
      const chunk = decoder.decode(v, { stream: true });
      buf += chunk;

      const parts = buf.split(matcher);
      buf = parts.pop();
      for (const i of parts.filter(p => p)) processLine(JSON.parse(i));
    });

    response.body.on('end', () => {
      if (buf.length > 0) processLine(JSON.parse(buf));
      resolve();
    });

    response.body.on('error', fail);
  
  });
};

getStream()

async function getStream() {
  const controller = new AbortController()
  const signal = controller.signal
  const res = await fetch('https://lichess.org/api/tv/feed', { signal })
  
  let count = 0
  res.body.on('data', (data) => {
    const decoder = new TextDecoder()
    const chunk = decoder.decode(data, { stream: true })
    console.log(JSON.parse(chunk))
    count ++
    console.log(count)
  })

  res.body.on('end', () => {
    console.log('done')
  })

  await new Promise(resolve => setTimeout(resolve, 15000))
  controller.abort()
  // const reader = res.body.getReader()
  // console.log(reader)
}




// or any other ND-JSON endpoint such as:
// const stream = fetch('https://lichess.org/api/games/user/neio',{headers:{Accept:'application/x-ndjson'}});

// const onMessage = obj => console.log(obj);
// const onComplete = () => console.log('The stream has completed');

// stream
//   .then(readStream(onMessage))
//   .then(onComplete);