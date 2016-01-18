var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  initial1: { type: String, default: null },
  initial2: String,
  color1: { type: Number, default: null },
  color2: Number,
  phase:  { type: Number, default: 0 },
  questions1: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, questionNum: Number}],
  questions2: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, questionNum: Number}],
  responses1: [{ response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' }, questionNum: Number}],
  responses2: [{ response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' }, questionNum: Number}],
  guess1: Number,
  guess2: Number,
  outcome: { type: Number, default: 0 },
  updateDate: { type : Date, default: Date.now },
  active: {type: Boolean, default: true },
  smartsRating1: Number,
  smartsRating2: Number,
  newSmartsRating1: Number,
  newSmartsRating2: Number,
  notif1: { type: Boolean, default: false },
  notif2: { type: Boolean, default: false },
  isMachine1: { type: Boolean, default: false },
  isMachine2: { type: Boolean, default: false }
});

mongoose.model('Game', GameSchema);