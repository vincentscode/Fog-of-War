const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const port = 8899;

const app = express();
app.use(cors())
app.use(bodyParser.json());

let currentData = {}

app.get('/data/:gameId', function(req, res) {
  console.log("POST", req.params.gameId)
  res.send(JSON.stringify(currentData[req.params.gameId]));
});

app.post('/data/:gameId', function(req, res) {
  console.log("POST", req.params.gameId, req.body)
  currentData[req.params.gameId] = req.body;
  res.json(JSON.stringify({
  	"status": "ok"
  }))
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})