const mongoose = require("mongoose")

const validateNewUser = () => {
  console.log("validating the new user...")
}


const userSchema = new mongoose.Schema({
  username: {
    required: true, 
    type: String, 
    trim: true,
    minlength: 8,
    maxlength: 25,
    unique: true,
    validate: validateNewUser
  }
}, { versionKey: false })


const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 75
  },
  duration: {
    type: Number,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    trim: true,
  }
})

// (database collection name, schema)
const User = mongoose.model("user", userSchema)
const Exercise = mongoose.model("exercise", exerciseSchema)     


module.exports = {User, Exercise}
    


