var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: process.env.SECRET, userProperty: 'payload'});

var Player = mongoose.model('Player');
var Question = mongoose.model('Question');
var Response = mongoose.model('Response');
var Game = mongoose.model('Game');

/* register a new player */
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var player = new Player();
  player.username = req.body.username;
  player.setPassword(req.body.password);

  player.save(function (err){
    if(err){ return next(err); }

    return res.json({token: player.generateJWT()})
  });
});

/* login existing player */
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, player, info){
    if(err){ return next(err); }

    if(player){
      return res.json({token: player.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/* get player from mongodb according to username */
var playerFromRequest = function(req, callback) {
	Player.find({ username: req.payload.username }, function(err, player) {
	    if (err) { return next(err); }
	    if (!player) { return next(new Error('can\'t find player')); }
	    if (player.length > 1) { return next(new Error('found more than one player')) };
		callback(player[0]);
	});
};

/* get player number in game */
var playerNum = function(player, game) {
    if (String(game.player1) == String(player._id)) {
        return 1;
    }
    if (String(game.player1._id) == String(player._id)) {
    	return 1;
    }
    if (String(game.player2) == String(player._id)) {
    	return 2;
    }
    if (String(game.player2._id) == String(player._id)) {
    	return 2;
    }
    console.log("ERROR; player._id is"+String(player._id));
    return 0;

};

/* make sure player is in game (not currently used) */
var checkMyGame = function(player, game) {
	return playerNum(player, game) > 0;
};

/* determine whether the player is waiting or not */
/* 0 = waiting, 1 = your turn, 2 = complete */
var getTurn = function(game, pNum) {
	if (game.phase == 1) {
        if ((pNum == 1) && (!game.questions2.length)) {
            return 0;
        }
        if ((pNum == 2) && (!game.questions1.length)) {
            return 0;
        }
    }
    if (game.phase == 3) {
        if ((pNum == 1) && (!game.responses2.length)) {
            return 0;
        }
        if ((pNum == 2) && (!game.responses1.length)) {
            return 0;
        }
    }
    if (game.phase == 5) {
        if ((pNum == 1) && (game.guess2 == null)) {
            return 0;
        }
        if ((pNum == 2) && (game.guess1 == null)) {
            return 0;
        }
    }
    if (game.phase >= 6)
        return 2;
    return 1;
};

/* convert full game to player view of game */
/* ensures that players cannot prematurely view opponent data */
var individualizeGame = function(player, game, callback) {
	var pNum = playerNum(player, game);
	var oNum = (pNum == 2) ? 1 : 2;

	var phase = game.phase;
	var opQuestions = [];
	var questions = game['questions'+String(pNum)];
	var responses = game['responses'+String(pNum)];
	var opResponses = [];
	var guess = game['guess'+String(pNum)];
	var opGuess = null;
	var outcome = game.outcome;
	var color = game['color'+String(oNum)];
	var initial = game['initial'+String(oNum)];
	var turn = getTurn(game, pNum);
	var _id = game._id;
	var updateDate = game.updateDate;
	var active = game['active'+String(pNum)];


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
		updateDate: updateDate,
		active: active
	};

	callback(o);
};


/* game routes */
/* new game */
router.post('/home', auth, function(req, res, next) {
	/* random opponent identifiers */
	var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'z'];
	var colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	var myInitial = letters[Math.floor(Math.random()*letters.length)];
	var myColor = colors[Math.floor(Math.random()*colors.length)];
	/* look up player */
	playerFromRequest(req, function (player){
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
			    	individualizeGame(player, game, function(indvGame) {
			    		res.json(indvGame);
			    	});    
			  });
		  }
		  else {
		  	individualizeGame(player, game, function(indvGame) {
			   	res.json(indvGame);
			});
		  }
		});
	});
});

/* get all games for a player */
router.get('/home', auth, function(req, res, next) {
	playerFromRequest(req, function(player){
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
		    	individualizeGame(player, games[i], function(indvGame) {
		    		indvGames.push(indvGame);
		    	});
		    }
			  res.json(indvGames);
			}
		);
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

router.get('/home/:game', auth, function(req, res) {
	playerFromRequest(req, function(player) {
  		req.game
	   	  .populate('questions1')
	   	  .populate('questions2')
	   	  .populate('responses1')
	   	  .populate('responses2', function(err, game) {
	    	if (err) { return next(err); }

	    	individualizeGame(player, game, function(indvGame) {
				res.json(indvGame);
			});
	  	});
  });
});

/* deactivate */
router.get('/home/:game/deactivate', auth, function(req, res) {
	playerFromRequest(req, function(player) {
  	  req.game['active'+String(playerNum(player, req.game))] = false;
	  req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
		});
	  });
	});
  });
});

/* interview */
router.post('/home/:game/interview', auth, function(req, res, next) {
  var questionInputs = req.body.questions;
  var questions = [];
  var i = 0;

  var saveGame = function(player) {
  	req.game['questions'+String(playerNum(player, req.game))] = questions;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
		});
	  });

	}); 
  };

  var saveQuestions = function(player) {
  	var question;
  	var questionInput;
  	
  	if (questionInputs.length == 0)
  		saveGame(player);
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
	  		saveQuestions(player);	
	  	});
  	}
  }

  playerFromRequest(req, function(player) {
  	saveQuestions(player);
  });

});


/* response */
router.post('/home/:game/response', auth, function(req, res, next) {
  var responseInputs = req.body.responses;
  var responses = [];
  var i = 0;

  var saveGame = function(player) {
  	req.game['responses'+String(playerNum(player, req.game))] = responses;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
		});
	  });

	}); 
  };

  var saveResponses = function(player) {
  	var response;
  	var responseInput;
  	
  	if (responseInputs.length == 0)
  		saveGame(player);
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
	  		saveResponses(player);	
	  	});
  	}
  }

  playerFromRequest(req, function(player) {
  	saveResponses(player);
  });
});

/* guess */
router.post('/home/:game/guess', auth, function(req, res, next) {
  var guess = req.body.guess;

  var saveGame = function(player) {
  	req.game['guess'+String(playerNum(player, req.game))] = guess;
  	req.game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		req.game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
		});
	  });

	}); 
  };

  playerFromRequest(req, function(player) {
  	saveGame(player);
  });
});


/* profile routes */
router.post('/profile', auth, function(req, res, next) {
  var player = new Player(req.body);

  player.save(function(err, player){
    if(err){ return next(err); }

    res.json(player);
  });
});

router.get('/profile', auth, function(req, res) {
  playerFromRequest(req, function(player) {
  	res.json(player);
  });
});
