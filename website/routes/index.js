var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

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

/* create reusable transporter object using the default SMTP transport */
var transportStr = 'smtps://postmaster@luna-game.com:'+process.env.MAILGUN+'@smtp.mailgun.org';
var transporter = nodemailer.createTransport(transportStr);

/* helper functions */
var add = function(a, b) {
    return a + b;
};

var mean = function(arr) {
	if (!arr.length)
		return 0;
	var s = arr.reduce(add, 0.0);
	return s/arr.length;
};

var getRandomInitial = function() {
	var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'z'];
	return letters[Math.floor(Math.random()*letters.length)];
};

var getRandomColor = function() {
	var colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	return colors[Math.floor(Math.random()*colors.length)];
};

var getRandomAlphanumericString = function(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

/* get player from mongodb according to username */
var playerFromRequest = function(req, callback) {
	Player.find({ username: req.payload.username }, function(err, player) {
	    if (err) { return err; }
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

var opNum = function(player, game) {
	return playerNum(player, game) == 2 ? 1 : 2;
}

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
	var outcome = null;
	var color = game['color'+String(oNum)];
	var initial = game['initial'+String(oNum)];
	var turn = getTurn(game, pNum);
	var _id = game._id;
	var updateDate = game.updateDate;
	var active = game.active;
	var smartsRating = 'Not set';
	var opSmartsRating = null;
	var oldSmartsRating = 'Not set';
	var notif = game['notif'+String(pNum)];
	var opMachine = null;


	if (phase > 1) {
		opQuestions = game['questions'+String(oNum)];
		if (phase > 3) {
			opResponses = game['responses'+String(oNum)];
			if (phase > 5) {
				opGuess = game['guess'+String(oNum)];
				smartsRating = game['newSmartsRating'+String(pNum)];
				opSmartsRating = game['smartsRating'+String(oNum)];
				oldSmartsRating = game['smartsRating'+String(pNum)];
				opMachine = game['isMachine'+String(oNum)];
				if (game.outcome == pNum)
					outcome = 1;
				else if (game.outcome == oNum)
					outcome = 0;
				else
					outcome = game.outcome;
			}
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
		active: active,
		smartsRating: smartsRating,
		opSmartsRating: opSmartsRating,
		oldSmartsRating: oldSmartsRating,
		notif: notif,
		opMachine: opMachine
	};

	callback(o);
};

var getAllGames = function(player, callback) {
	Game.find({ $or:
		[ {'player1':player._id}, 
		  {'player2':player._id} ]
		})
	  .populate('questions1.question')
	  .populate('questions2.question')
	  .populate('responses1.response')
	  .populate('responses2.response')
	  .exec(function (err, games){
	    if (err) { 
	    	return next(err); 
	    }
	    callback(games);
	  });
};

var getCurrentOpponents = function(player, callback) {
	var ops = [];
	getAllGames(player, function(games) {
		for (var i=0; i<games.length; i++)
		{
			if (games[i].active) {
				if (playerNum(player, games[i]) == 1) {
					if (games[i].player2)
						ops.push(games[i].player2);
				}
				else {
					ops.push(games[i].player1);
				}
			}
		}
		callback(ops);
	});
};

var activeGameCount = function(player, callback) {
	getAllGames(player, function(games) {
		var activeCount = 0;
		for (var i=0; i<games.length; i++)
		{
			if (games[i].active)
				activeCount++;
		}
		callback(activeCount);
	});
};

/* register a new player */
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var player = new Player();
  player.username = req.body.username;
  player.setPassword(req.body.password);
  player.initial = getRandomInitial();
  player.color = getRandomColor();

  player.save(function (err){
    if(err){ return next(err); }

    return res.json({token: player.generateJWT()})
  });
});

/* register a guest */
router.get('/registerGuest', function(req, res, next){

  var usercandidate = getRandomAlphanumericString(32);
  var password = getRandomAlphanumericString(32);

  var checkUniqueUsername = function(callback) {
  	Player.findOne({username: usercandidate})
  	  .exec(function(user) {
  	  	if (user != null) {
  	  		usercandidate = getRandomAlphanumericString(32);
  	  		checkUniqueUsername();
  	  	}
  	  	else {
  	  		callback();
  	  	}
  	  });
  };

  checkUniqueUsername(function() {
  	var player = new Player();
	player.username = usercandidate;
	player.setPassword(password);
	player.initial = getRandomInitial();
	player.color = getRandomColor();
	player.isGuest = true;

	player.save(function (err){
	  if(err){ return next(err); }

	  return res.json({token: player.generateJWT()})
	});
  });
});

/* register a guest */
router.post('/registerMachine', function(req, res, next){

  var password = getRandomAlphanumericString(32);

  var player = new Player();
  player.username = req.body.username;
  player.setPassword(password);
  player.initial = getRandomInitial();
  player.color = getRandomColor();
  player.isMachine = true;

  player.save(function (err){
	if(err){ return next(err); }
	return res.json({token: player.generateJWT()})
  });
});

/* save a guest */
router.post('/saveGuest', auth, function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  playerFromRequest(req, function(player) {

	  player.username = req.body.username;
	  player.setPassword(req.body.password);

	  player.save(function (err){
	    if(err){ return next(err); }

	    return res.json({token: player.generateJWT()})
	  });
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


/* game routes */
/* new game */
router.post('/home', auth, function(req, res, next) {
	/* random opponent identifiers */
	var myInitial = getRandomInitial();
	var myColor = getRandomColor();

	/* look up player */
	playerFromRequest(req, function (player){
	    req.player = player;
	    var myMachine = player.isMachine;

	    /* if >= 5 games, don't create a new one */
	    activeGameCount(player, function(count) {
	    	if (count >= 5)
	    		res.json(false);
	    	else {

				/* first check if there are any open games */
				var excludes = [{"player2": null}, {"player1": { $ne: player }}];
				
				/* exclude active opponents */
				getCurrentOpponents(player, function(opponents){
					var exclude;
					for (var i=0; i<opponents.length; i++) {
						exclude = {"player1": { $ne: opponents[i]}};
						excludes.push(exclude);
					}

					var query = { $and: excludes };
					var update = {
				     	$set: { player2: player,
				     		    initial1: myInitial,
				     		    color1: myColor ,
				     		    isMachine2: myMachine
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
					  					 color2: myColor,
					  					 isMachine1: myMachine
					  					});
					  	game.save(function(err, game){
						    if(err){ return next(err); }
						    	submitInterview(player, req.body.questions, game, res);    
						  });
					  }
					  else {
					  	individualizeGame(player, game, function(indvGame) {
						   	submitInterview(player, req.body.questions, game, res);
						});
					  }
				    });
				});
			}
		});
	});
});

/* get all games for a player */
router.get('/home', auth, function(req, res, next) {
	playerFromRequest(req, function(player){
		getAllGames(player, function(games){
			var indvGames = [];
		    for (var i=0; i<games.length; i++) {
		    	individualizeGame(player, games[i], function(indvGame) {
		    		indvGames.push(indvGame);
		    	});
		    }
			res.json(indvGames);
		});
	});
});

/* single game routes */
router.param('game', function(req, res, next, id) {
	if (id !== 'interview') {
  	var query = Game.findById(id);
	query.exec(function (err, game){
	  if (err) { return next(err); }
	  if (!game) { return next(new Error('can\'t find game')); }

      req.game = game;
	  return next();
  });
}
});

router.get('/home/:game', auth, function(req, res) {
	playerFromRequest(req, function(player) {
  		req.game
	   	  .populate('questions1.question')
	   	  .populate('questions2.question')
	   	  .populate('responses1.response')
	   	  .populate('responses2.response', function(err, game) {
	    	if (err) { return next(err); }

	    	individualizeGame(player, game, function(indvGame) {
				res.json(indvGame);
			});
	  	});
  });
});

/* save response grades */
router.put('/home/responseGrades', auth, function(req, res) {
	var responseGrades = req.body;
	for (var i=0; i<responseGrades.length; i++) {
		Response.findByIdAndUpdate(
			responseGrades[i].rid,
			{ $set: { grade : responseGrades[i].grade }})
			.exec();
	}
	res.json(true);
});

/* deactivate */
router.get('/home/:game/deactivate', auth, function(req, res) {
	playerFromRequest(req, function(player) {
  	  req.game.active = false;
	  saveGameInMongo(player, req.game, function(game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
		});
	  });
	});
});

var getPlayerFromGame = function(game, playerNum, callback) {
	var playerID;
	if (playerNum == 1) {
		playerID = game['player1'];
	}
	else {
		playerID = game['player2'];
	}

	Player.find({ _id: playerID }, function(err, player) {
	    if (err) { return err; }
	    if (!player) { return next(new Error('can\'t find player')); }
	    if (player.length > 1) { return next(new Error('found more than one player')) };
		callback(player[0]);
	});
};

var sendNotificationEmail = function(player) {
	if (!player.isGuest) {
		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: 'Luna Game <noreply@luna-game.com>', // sender address
		    to: player.username, // list of receivers
		    subject: "It's your turn to play!", // Subject line
		    text: "It's your turn to play a Luna Game. Visit http://luna-game.com to play!", // plaintext body
		    html: "It's your turn to play a Luna Game. Visit <a href='http://luna-game.com'>http://luna-game.com</a> to play!" // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});
	}
};

var saveGameInMongo = function(player, game, callback) {
	var op = opNum(player, game);
	game['notif'+String(op)] = true;

	game.save(function(err, game) {
	  if(err){ return next(err); }
	  // To avoid race condition, atomically update phase
	  Game.findByIdAndUpdate(
		game._id,
		{ $inc: { phase : 1} },
		{ new: true }, function(err, game) {
			callback(game);
	  });
	});

	getPlayerFromGame(game, op, function(opponent) {
		if (typeof opponent != "undefined")
			sendNotificationEmail(opponent);
	});
};

/* interview */
var submitInterview = function(player, userQuestions, game, res) {
	var questionInputs = userQuestions;
	var questions = [];
	var i = 0;

	var saveGame = function(player) {
		var qs = [];
		for (var i=0; i<questions.length; i++){
			qs.push({
				question: questions[i],
				questionNum: i
			});
		}
		game['questions'+String(playerNum(player, game))] = qs;
		saveGameInMongo(player, game, function(game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
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
	  		question: nextQuestion
	  	}
	  	
			/* see if this question has already been asked */
			Question.findOne(questionInput, function(err, question) {
		    if (err) { return next(err); }

		    /* new question */
		    if (question === null && typeof question === "object") {
		    	question = new Question(questionInput);
		    }

		    /* old question */
		    else {
		    	question.numGames += 1;
		    }

		    question.save(function(err, question){
		    	if(err){ return next(err); }
				questions.push(question);
				i++;
		  		saveQuestions(player);	
		  	});

		});
		}
	}

	saveQuestions(player);
};


/* response */
router.post('/home/:game/response', auth, function(req, res, next) {
  var responseInputs = req.body.responses;
  var responses = [];

  var saveGame = function(player) {
  	var rs = [];
  	for (var i=0; i<responses.length; i++){
  		rs.push({
  			response: responses[i],
  			questionNum: i
  		});
  	}
  	req.game['responses'+String(playerNum(player, req.game))] = rs;
  	saveGameInMongo(player, req.game, function(game) {
		individualizeGame(player, game, function(indvGame) {
			res.json(indvGame);
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
	  		response: nextResponse
	  	}

	  	response = new Response(responseInput);

	  	response.save(function(err, response){
	    	if(err){ return next(err); }
			responses.push(response);
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

  var updatePlayer = function(player, callback) {
  	Player.findById(player._id)
  		.exec(function(err, savedPlayer) {
  			Object.assign(savedPlayer, player);
  			savedPlayer.save(function(err, savedPlayer) {
  				if(err){ return next(err); }
		  		callback();
  			});
  		});
  };

  var updateQuestions = function(questions, callback) {
  	if (questions.length == 0)
  		callback();
  	else {
  		var nextQuestion = questions.pop();
  		Question
  			.findById(nextQuestion.question._id)
  			.exec(function(err, savedQuestion) {
  				savedQuestion.numWins += 1;
  				savedQuestion.save(function(err, savedQuestion) {
  					updateQuestions(questions, callback);
  				});
  			})
  	}
  };

  var finishGame = function(game, callback) {
  	Game.findById(game._id)
  		.populate('player1')
  		.populate('player2')
  		.populate('questions1.question')
  		.populate('questions2.question')
  		.exec(function(err, game) {

  		if (!game.isMachine2)
  			game.player1.guessHistory.push(game.guess2);
  		if (!game.isMachine1)
  			game.player2.guessHistory.push(game.guess1);

  		var firstTime1 = (game.player1.guessHistory.length <= 1);
  		var firstTime2 = (game.player2.guessHistory.length <= 1);
  		var isWinner1 = false;
  		var isWinner2 = false;

  		game.smartsRating1 = game.player1.smartsRating;
  		game.smartsRating2 = game.player2.smartsRating;

  		if (!firstTime1)
  			game.player1.smartsRating = mean(game.player1.guessHistory);
  		else if (!game.isMachine2)
  			game.player1.smartsRating = game.guess2;

  		if (!firstTime2)
  			game.player2.smartsRating = mean(game.player2.guessHistory);
  		else if (!game.isMachine1)
  			game.player2.smartsRating = game.guess1;

  		game.newSmartsRating1 = game.player1.smartsRating;
  		game.newSmartsRating2 = game.player2.smartsRating;

  		var now = new Date().toISOString();

  		game.player1.smartsRatingHistory.push({rating: game.player1.smartsRating, date: now});
  		game.player2.smartsRatingHistory.push({rating: game.player2.smartsRating, date: now});

  		var err1 = Math.abs(game.smartsRating2 - game.guess1);
		var err2 = Math.abs(game.smartsRating1 - game.guess2);

		if (firstTime1 || firstTime2) {
			isWinner1 = true;
			isWinner2 = true;

			if (firstTime1 && firstTime2)
				game.outcome = 3;
			else if (firstTime1)
				game.outcome = 2;
			else
				game.outcome = 1;
		}

		else {
			if (err1 > err2) {
				game.outcome = 2;
				isWinner2 = true;
			}
			else if (err2 > err1) {
				game.outcome = 1;
				isWinner1 = true;
			}
			else {
				game.outcome = 3;
			}
		}

		game.player1.numGames += 1;
		game.player2.numGames += 1;

		var questionsToUpdate = [];

		if (isWinner1) {
			game.player1.numWins += 1;
			game.player1.winningStreak += 1;
			if (game.player1.winningStreak > game.player1.winningStreakRecord) {
				game.player1.winningStreakRecord = game.player1.winningStreak;
			}
			questionsToUpdate = game.questions1;
		}
		else {
			game.player1.winningStreak = 0;
		}

		if (isWinner2) {
			game.player2.numWins += 1;
			game.player2.winningStreak += 1;
			if (game.player2.winningStreak > game.player2.winningStreakRecord) {
				game.player2.winningStreakRecord = game.player2.winningStreak;
			}
			questionsToUpdate = game.questions2;
		}
		else {
			game.player2.winningStreak = 0;
		}

		game.save(function(err, game) {
	  		if(err){ return next(err); }
	  		updatePlayer(game.player1, function(){
	  		  updatePlayer(game.player2, function() {
	  		  	updateQuestions(questionsToUpdate, function() {
	  		  		callback(game);
	  		  	});
	  		  });
	  		});
	  	});

  	});
  };

  var saveGame = function(player) {
  	req.game['guess'+String(playerNum(player, req.game))] = guess;
  	saveGameInMongo(player, req.game, function(game) {
		if (game.phase == 6) {
		  finishGame(game, function(game) {
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
  };

  playerFromRequest(req, function(player) {
  	saveGame(player);
  });
});

/* notifications */
router.delete('/notifs', auth, function(req, res, next) {
  playerFromRequest(req, function(player) {
  	Game.update({
		'player1':player._id
	  }, {
  		$set: { notif1: false }
	  }, {
		multi: true
	  }, function() {
	  Game.update({
		 'player2':player._id
		}, {
	   		$set: { notif2: false }
		}, {
			multi: true
		}, function() {
			res.json(true);
		});
	  });
  });
});

/* old questions */
router.get('/oldquestions', auth, function(req, res) {
  playerFromRequest(req, function(player) {
  	Question
  	  .find({ player: player })
  	  .exec(function(err, questions) {
  	  	res.json(questions);
  	  });
  });	
});

/* profile */
router.get('/profile', auth, function(req, res) {
  playerFromRequest(req, function(player) {
  	var o = {
  		joinDate: player._id.getTimestamp(),
  		player: player
  	};
  	res.json(o);
  });
});

router.post('/profile/initial', auth, function(req, res, next) {
  playerFromRequest(req, function(player) {
  	  
  	var newInitial = req.body.initial;
  	player.initial = newInitial;

  	player.save(function(err, player){
	  if(err){ return next(err); }

	  res.json(newInitial);
	});
  });
});

router.post('/profile/color', auth, function(req, res, next) {
  playerFromRequest(req, function(player) {

  	var newColor = req.body.color;
  	player.color = newColor;

  	player.save(function(err, player){
	  if(err){ return next(err); }

	  res.json(newColor);
	});
  });
});

/* error handling */
router.get('*', function(req, res){
  res.render('404');
});