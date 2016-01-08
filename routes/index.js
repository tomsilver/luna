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

/* figure out how to handle this with get /home.. */
var player = { _id: "568c52ded4566fa60b760937" };
var playerNum = function(game) {
    if (game.player1 == player._id) {
        return 1;
    }
    if (game.player1._id == player._id) {
    	return 1;
    }
    if (game.player2 == player._id) {
    	return 2;
    }
    if (game.player2._id == player._id) {
    	return 2;
    }
    console.log("ERROR; player._id is"+String(player._id));

};

var getTurn = function(game, pNum) {
	if (game.phase == 1) {
        if ((pNum == 1) && (!game.questions2.length)) {
            return "Waiting";
        }
        if ((pNum == 2) && (!game.questions1.length)) {
            return "Waiting";
        }
    }
    if (game.phase == 3) {
        if ((pNum == 1) && (!game.responses2.length)) {
            return "Waiting";
        }
        if ((pNum == 2) && (!game.responses1.length)) {
            return "Waiting";
        }
    }
    if (game.phase == 5) {
        if ((pNum == 1) && (game.guess2 == null)) {
            return "Waiting";
        }
        if ((pNum == 2) && (game.guess1 == null)) {
            return "Waiting";
        }
    }
    if (game.phase == 6)
        return "Game Complete";
    return "Your Turn";
};

/* convert full game to player view of game */
var individualizeGame = function(game, callback) {
	var pNum = playerNum(game);
	var oNum = (pNum == 2) ? 1 : 2;

	var phase = game.phase;
	var opQuestions = [];
	var questions = game['questions'+String(pNum)];
	var responses = game['responses'+String(oNum)];
	var opResponses = [];
	var guess = game['guess'+String(pNum)];
	var opGuess = null;
	var outcome = game.outcome;
	var color = game['color'+String(oNum)];
	var initial = game['initial'+String(oNum)];
	var turn = getTurn(game, pNum);
	var _id = game._id;
	var updateDate = game.updateDate;


	if (phase > 1) {
		opQuestions = game['questions'+String(oNum)];
		if (phase > 3) {
			opResponses = game['responses'+String(oNum)];
			if (phase > 5)
				opGuess = game['guess'+String(oNum)];
		}
	}

	var o = {
		_id: _id,
		questions: questions,
		opQuestions: opQuestions,
		responses: responses,
		opResponses: opResponses,
		guess: guess,
		opGuess: opGuess,
		outcome: outcome,
		color: color,
		initial: initial,
		turn: turn,
		phase: phase,
		updateDate: updateDate
	};

	callback(o);

	return o;
};


/* game routes */
/* new game */
router.post('/home', function(req, res, next) {
	var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'z'];
	var colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	var myInitial = letters[Math.floor(Math.random()*letters.length)];
	var myColor = colors[Math.floor(Math.random()*colors.length)];
	/* look up player */
	var query = Player.findById(req.body._id);
	query.exec(function (err, player){
	    if (err) { return next(err); }
	    if (!player) { return next(new Error('can\'t find player')); }

	    req.player = player;
		/* first check if there are any open games */
		var query = {"player2": null, "player1": { $ne: player }};
		var update = {
	     	$set: { phase: 1, 
	     		    player2: player,
	     		    initial1: myInitial,
	     		    color1: myColor 
	     		  }
		};
		var options = { new: true };
		Game.findOneAndUpdate(query, update, options, function(err, game) {
		  if (err) {
		    console.log('got an error');
		    console.log(err);
		  }
		  /* no open games, so create a new one */
		  if (game === null && typeof game === "object") {
		  	game = new Game({
		  					 player1: player, 
		  					 player2: null,
		  					 initial2: myInitial,
		  					 color2: myColor
		  					});
		  	game.save(function(err, game){
			    if(err){ return next(err); }
			    	individualizeGame(game, function(indvGame) {
			    		res.json(indvGame);
			    	});    
			  });
		  }
		  else {
		  	individualizeGame(game, function(indvGame) {
			   	res.json(indvGame);
			});
		  }
		});
	});
});

/* get all games for a player */
router.get('/home', function(req, res, next) {
	Game.find({ $or:
		[ {'player1':player._id}, 
		  {'player2':player._id} ]
		},
		function (err, games){
	    if (err) { 
	    	return next(err); 
	    }
	    var indvGames = [];
	    for (var i=0; i<games.length; i++) {
	    	individualizeGame(games[i], function(indvGame) {
	    		indvGames.push(indvGame);
	    	});
	    }
		  res.json(indvGames);
		}
	);
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

    	individualizeGame(req.game, function(indvGame) {
			res.json(indvGame);
		});
  	});
});

/* interview */
router.post('/home/:game/interview', function(req, res, next) {
  var player = req.body.player;
  var questionInputs = req.body.questions;
  var questions = [];
  var i = 0;

  var saveGame = function() {
  	req.game['questions'+String(playerNum(req.game))] = questions;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(game, function(indvGame) {
			res.json(indvGame);
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
  var responseInputs = req.body.responses;
  var responses = [];
  var i = 0;

  var saveGame = function() {
  	req.game['responses'+String(playerNum(req.game))] = responses;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(game, function(indvGame) {
			res.json(indvGame);
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

/* guess */
router.post('/home/:game/guess', function(req, res, next) {
  var player = req.body.player;
  var guess = req.body.guess;

  var saveGame = function() {
  	req.game['guess'+String(playerNum(req.game))] = guess;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(game, function(indvGame) {
			res.json(indvGame);
		});
	  });

	}); 
  };

  saveGame();
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