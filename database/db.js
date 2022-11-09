//Set up mongoose connection
const mongoose = require('mongoose');

let mongoDB = process.env.MONGODB_URI || "mongodb://localhost:27017";

mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});

let db = mongoose.connection;
db.on('connected', function() {
  console.log('MongoDB connected successfully')
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;