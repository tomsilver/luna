var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  question: String,
  numGames: { type: Number, default: 1 },
  numWins: { type: Number, default: 0 }
});

mongoose.model('Question', QuestionSchema);