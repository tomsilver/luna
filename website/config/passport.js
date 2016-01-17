var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Player = mongoose.model('Player');

passport.use(new LocalStrategy(
  function(username, password, done) {
    Player.findOne({ username: username }, function (err, player) {
      if (err) { return done(err); }
      if (!player) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!player.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, player);
    });
  }
));