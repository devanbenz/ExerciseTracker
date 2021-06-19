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
  username: String,
  count: Number,
  log: [{
      _id: false,
      description: String,
      duration: Number,
      date: String
    }]
})
// Create a URL model out of the schema 
const Users = mongoose.model('Users', UserSchema)


//-----------------------------------------------------------------------------------------

app.post('/api/users', async (req, res) => {
  // Pull username from body request
  const { username } = req.body
  
  // Check if user exists
  const userExists = await Users.exists({ username:username })
  if(userExists){
    res.send('User exists')
  }
  else {
    // Add user to db 
    const userAdd = await Users.create({
      username: username
    })
    userAdd.save()
  
    // Send response object to browser 
    res.json({
      _id: userAdd._id,
      username: userAdd.username,
    })
  }
})

app.get('/api/users', async (req, res) => {
  const userArr = []
  const all = await Users.find({}).select("-log")

  all.forEach(x => userArr.push(x))

  res.send(userArr)

})

app.post('/api/users/:_id/exercises', async (req, res) =>{
  try {
    let { description, duration, date } = req.body
    const { _id } = req.params
  
    if(!date) {
      date = new Date().toDateString()
    }else{
      date = new Date(`${date} 00:00:00`).toDateString()
    }
    
    let user = await Users.findByIdAndUpdate(_id, { $push: {log: [{
      description: description,
      duration: duration,
      date: date      
    }]}}, {new: true}) // <----- ew 
    user.save()

    res.status(200).json({
      _id: user._id,
      username: user.username,
      description: user.log[user.log.length - 1].description,
      duration: user.log[user.log.length - 1].duration,
      date: user.log[user.log.length - 1].date 
    }).end()
  }
  catch(e) { console.log(e) }
})

app.get('/api/purge', async (req, res) => {
  try{
    await Users.deleteMany({})
    res.send("Users removed")
  }catch(e){ console.log(e) }
})

app.get('/api/users/:_id/logs', async (req, res) => { 
  try {
    const { _id } = req.params
    let logArr = []
    let user = await Users.findById(_id)
    if(req.query.from && req.query.to) {
      console.log(req.query.from)
      user.log.forEach( x => {
        if(Date.parse(x.date) >= Date.parse(req.query.from) && Date.parse(x.date) <= Date.parse(req.query.to)){
          logArr.push(x)  
        }
      })
    }
    else if(req.query.from) {
      console.log(req.query.from)
      user.log.forEach( x => {
        if(Date.parse(x.date) >= Date.parse(req.query.from)){
          logArr.push(x)
        }
      })
    }
    else{
      user.log.forEach( x => {
        logArr.push(x)
      })
    }

    if(req.query.limit){
      logArr.length = req.query.limit
    }

    console.log(logArr)

    res.json({
      _id: user._id,
      username: user.username,
      count: user.log.length,
      log: logArr
    })

  }catch(e){ console.log(e) }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
