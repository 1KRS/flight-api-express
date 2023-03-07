import axios from 'axios'
import express from 'express'

const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/flights', (req, res) => {
    axios.get('https://raw.githubusercontent.com/saltstudy/pgp-test-flightFinder-json/main/data.json')
    .then(response => {
      let flightsdb = []
      response.data.map(flight => {
        flightsdb.push(flight)
      })
      console.log(flightsdb)
      res.json(flightsdb)
    })
    .catch((err) => {console.log(err)})
})

app.listen(port, () => {
  console.log(`Ο διακομιστής ακούει στην πύλη ${port}`)
})