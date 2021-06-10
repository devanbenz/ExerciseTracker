const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// ------------------------ MONGO DB STUFF ----------------------------------------------
const mongoose = require('mongoose')
// MongoDB uri
const uri = process.env.MONGO_URI
// Connect to mongodb with mongoose 
const db = mongoose.connect(uri, {useNewUrlParser:true, useUnifiedTopology: true})

// Create user schema 
const UserSchema = mongoose.Schema({
  name: String
})
// Create a URL model out of the schema 
const Urls = mongoose.model('Users', UserSchema)


//-----------------------------------------------------------------------------------------

app.post('/api/users', (req, res) => {
  res.json({username: req.body.username})
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
