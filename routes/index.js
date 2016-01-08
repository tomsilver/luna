var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Player = mongoose.model('Player');
var Question = mongoose.model('Question');
var Response = mongoose.model('Response');
var Game = mongoose.model('Game');

/* game routes */
/* new game */
router.post('/home', function(req, res, next) {
	/* look up player */
	var query = Player.findById(req.body._id);
	query.exec(function (err, player){
	    if (err) { return next(err); }
	    if (!player) { return next(new Error('can\'t find player')); }

	    req.player = player;
		/* first check if there are any open games */
		var query = {"player2": null, "player1": { $ne: player }};
		var update = {
	     	$set: { phase: 1, player2: player }
		};
		var options = { new: true };
		Game.findOneAndUpdate(query, update, options, function(err, game) {
		  if (err) {
		    console.log('got an error');
		    console.log(err);
		  }
		  /* no open games, so create a new one */
		  if (game === null && typeof game === "object") {
		  	game = new Game({player1: player, player2: null});
		  	game.save(function(err, game){
			    if(err){ return next(err); }

			    res.json(game);
			  });
		  }
		  else {
		  	res.json(game);
		  }
		});
	});
});

/* single game routes */
router.param('game', function(req, res, next, id) {
  var query = Game.findById(id);

  query.exec(function (err, game){
    if (err) { return next(err); }
    if (!game) { return next(new Error('can\'t find game')); }

    req.game = game;
    return next();
  });
});

router.get('/home/:game', function(req, res) {
    req.game
   	  .populate('questions1')
   	  .populate('questions2')
   	  .populate('responses1')
   	  .populate('responses2', function(err, game) {
    	if (err) { return next(err); }

    	res.json(req.game);
  	});
});

/* interview */
router.post('/home/:game/interview', function(req, res, next) {
  var player = req.body.player;
  var playerNum = req.body.playerNum;
  var questionInputs = req.body.questions;
  var questions = [];
  var i = 0;

  var saveGame = function() {
  	req.game['questions'+String(playerNum)] = questions;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		res.json({
			questions: questions,
			nextPhase: game.phase
		});
	  });

	}); 
  };

  var saveQuestions = function() {
  	var question;
  	var questionInput;
  	
  	if (questionInputs.length == 0)
  		saveGame();
  	else {
  		var nextQuestion = questionInputs.shift();
	  	
	  	questionInput = {
	  		player: player,
	  		questionNum: i,
	  		question: nextQuestion
	  	}

	  	question = new Question(questionInput);

	  	question.save(function(err, question){
	    	if(err){ return next(err); }
			questions.push(question);
			i++;
	  		saveQuestions();	
	  	});
  	}
  }

  saveQuestions();
});


/* response */
router.post('/home/:game/response', function(req, res, next) {
  var player = req.body.player;
  var playerNum = req.body.playerNum;
  var responseInputs = req.body.responses;
  var responses = [];
  var i = 0;

  var saveGame = function() {
  	req.game['responses'+String(playerNum)] = responses;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		res.json({
			responses: responses,
			nextPhase: game.phase
		});
	  });

	}); 
  };

  var saveResponses = function() {
  	var response;
  	var responseInput;
  	
  	if (responseInputs.length == 0)
  		saveGame();
  	else {
  		var nextResponse = responseInputs.shift();
	  	
	  	responseInput = {
	  		player: player,
	  		questionNum: i,
	  		response: nextResponse
	  	}

	  	response = new Response(responseInput);

	  	response.save(function(err, response){
	    	if(err){ return next(err); }
			responses.push(response);
			i++;
	  		saveResponses();	
	  	});
  	}
  }

  saveResponses();
});


/* profile routes */
router.post('/profile', function(req, res, next) {
  var player = new Player(req.body);

  player.save(function(err, player){
    if(err){ return next(err); }

    res.json(player);
  });
});

router.param('player', function(req, res, next, id) {
  var query = Player.findById(id);

  query.exec(function (err, player){
    if (err) { return next(err); }
    if (!player) { return next(new Error('can\'t find player')); }

    req.player = player;
    return next();
  });
});

router.get('/profile/:player', function(req, res) {
  res.json(req.player);
});