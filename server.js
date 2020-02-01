"use strict"

const express = require("express")
const mongo = require("mongodb")
const mongoose = require("mongoose")
const app = express()

const port = process.env.PORT || 3000
const client = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true ,  useUnifiedTopology: true })
/*
// is there a connection to the DB?
setTimeout(() => {
  console.log("mongoose connected: " + mongoose.connection.readyState)}, 2000)
*/

const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const {User, Exercise} = require("./models")


app.listen(port, () => {
  console.log('Node.js listening ...')
})


app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})


app.get("/api/exercise/users", (req, res) => {
  // Get a list of all users in the database
   User.find({}).then(data => res.json(data))
})


app.get("/api/exercise/log?:userId?:from?:to?:limit", (req, res) => {
  // Get a users exercise log from the databse
  const {userId, from, to, limit} = req.query
  console.log("GET user exercise logs accessed: " + userId + "  " + from + "  " + to + "  " + limit)
  
  // search by name, dates optional
  let param = {userId: userId}
  if (from && to)
    param.date = {$gte: from, $lte: to}
  
  Exercise.find(param).limit(parseInt(limit)).then(data => 
    data.length ? res.json(data) : res.json({error: "No exercises found for specified user"})    
  )
})


app.post("/api/exercise/new-user", (req, res) => {
  // Add a new user to the database
  const username = req.body.username
  const newUser = new User({username: username})
  newUser.save().then(data => res.json(data), err => {if (err) res.json({error: err})})
})
   

app.post("/api/exercise/add", (req, res) => {
  // Add an exercise to a user in the database
  const {userId, description, duration} = req.body
    
  // Check if username exists
  User.findOne({username: userId}).then(data => {
    if (data !== null) {
      // Check the date format entered in form
      let date = req.body.date      
      if (date) {
        const regEx = /^\d{4}\-\d{1,2}\-\d{1,2}$/
        if (!regEx.test(date))
          return res.json({error: "Invalid Date format"})
      }
      else 
        date = Date()
      
      const newExercise = new Exercise({userId: data.username, description: description, duration: duration, date: date})
      newExercise.save().then(data => res.json(data), err => {if (err) res.json({error: err})})
    }
    else
      res.json({error: "No user: " + userId + " found in database"})
  })
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


