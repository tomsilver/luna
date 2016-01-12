var mongoose = require('mongoose');

var ResponseSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  response: String
});

mongoose.model('Response', ResponseSchema);