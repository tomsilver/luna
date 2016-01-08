var mongoose = require('mongoose');

var ResponseSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  questionNum: Number,
  response: String
});

mongoose.model('Response', ResponseSchema);