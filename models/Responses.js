var mongoose = require('mongoose');

var ResponseSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
});

mongoose.model('Response', ResponseSchema);