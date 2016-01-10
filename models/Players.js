var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var secret = process.env.SECRET;
console.log("secret is "+secret);

var PlayerSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  hash: String,
  salt: String,
  smartsRating: { type: Number, default: null },
  smartsRatingHistory : [{ rating: Number, date: Date }],
  guessHistory : [{ type: Number }],
  numWins: { type: Number, default: 0 },
  winningStreak: { type: Number, default: 0 },
  winningStreakRecord: { type: Number, default: 0 },
  numGames: { type: Number, default: 0 },
  isMachine: { type: Boolean, default: 0 },
  initial: String,
  color: Number,
  updated: { type: Date, default: Date.now }
});

PlayerSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

PlayerSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

PlayerSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};


mongoose.model('Player', PlayerSchema);