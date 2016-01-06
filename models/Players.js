var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
  name: String,
  updated: { type: Date, default: Date.now }
});

mongoose.model('Player', PlayerSchema);