const express = require('express')
const app = express()
const port = 3100
const cors = require('cors')

app.use(cors());
app.use(express.static(__dirname + "/dist"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/dist/index.html")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})