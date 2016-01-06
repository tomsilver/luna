var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  questionNum: Number,
  question: String
});

mongoose.model('Question', QuestionSchema);