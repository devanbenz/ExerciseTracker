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
  name: String,
  description: String,
  duration: Number,
  date: Number
})
// Create a URL model out of the schema 
const Users = mongoose.model('Users', UserSchema)


//-----------------------------------------------------------------------------------------

app.post('/api/users', async (req, res) => {
  // Pull username from body request
  const { username } = req.body
  
  // Check if user exists
  const userExists = await Users.exists({ name:username })
  if(userExists){
    res.send('User exists')
  }
  else {
    // Add user to db 
    const userAdd = await Users.create({
      name: username
    })
    userAdd.save()
  
    // Send response object to browser 
    res.json({
      _id: userAdd._id,
      username: userAdd.name,
    })
  }
})

app.get('/api/users', async (req, res) => {
  const userArr = {}
  const all = await Users.find({})
  
  for(let i = 1; i < all.length; i++) {
    userArr.i = all
  }
  // List all users
  res.send(userArr.i)

})
  



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
