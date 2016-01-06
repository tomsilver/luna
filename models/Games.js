var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  phase:  { type: Number, default: 0 },
  questions1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  questions2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  response1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  response2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  guess1: Number,
  guess2: Number,
  outcome: { type: Number, default: 0 }
});

mongoose.model('Game', GameSchema);