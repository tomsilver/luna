var mongoose = require('mongoose');

var ResponseSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  response: String,
  grade: {type: Number, default: -1}
});

mongoose.model('Response', ResponseSchema);