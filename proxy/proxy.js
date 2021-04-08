const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 5000;



app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get('/health', (req, res) => {
  res.json({'status': 'ok'})
})

app.get('/token', async (req, res) => {
  const redirect  = 'https://thinktt.github.io/yeoldwizard'
  const auth = 'TDQ3VHFwWm43aWFKcHBHTTpDZGY3aGxhSndKbWVyd2JESEZ1cWxQQVVnR1U3eGtTNw=='
  
  console.log('Received a code at ' + req.headers.host)
  console.log('Redirect url is set to ' + redirect)

  const query =  `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect}`
  console.log(query)
  console.log(auth)

  fetch('https://oauth.lichess.org/oauth', {
    body: query,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}` ,
    },
  })
  .then(lires => {
    if (!lires.ok) {
      console.log(lires)
      res.status(500).json({ error: "boo" });
      throw new Error(res.statusText);
    } 
    return lires.json()
  })
  .then(data => {
     res.json(data)
  })
  .catch(err => {
    console.log(err)
  })
 

});

app.listen(port, () => console.log(`Server started on port ${port}`));
