luna
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('lunaCtrl', [
        '$timeout',
        '$state',
        '$scope',
        '$location',
        '$anchorScroll',
        'games',
        'growlService',
        function($timeout, $state, $scope, $location, $anchorScroll, games, growlService){
        
        $anchorScroll.yOffset = 80;

        // Detect Mobile Browser
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
           angular.element('html').addClass('ismobile');
        }

        // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
        this.sidebarToggle = {
            left: false,
            right: false
        }

        // By default template has a boxed layout
        this.layoutType = localStorage.getItem('ma-layout-status');
        
        // For Mainmenu Active Class
        this.$state = $state;    
        
        //Close sidebar on click
        this.sidebarStat = function(event) {
            if (!angular.element(event.target).parent().hasClass('active')) {
                this.sidebarToggle.left = false;
            }
        }

        //Skin Switch
        this.currentSkin = 'bluegray';

        this.skinList = [
            'lightblue',
            'bluegray',
            'cyan',
            'teal',
            'green',
            'orange',
            'blue',
            'purple'
        ];

        this.skinSwitch = function (color) {
            this.currentSkin = color;
        };

        /* put games here so alerts can access */

        $scope.currentOrPast = 'Current';
        $scope.games = [];
        $scope.notifiedGamesCount = 0;

        /* for consent */
        $scope.signUp = {
            'v': true,
            'c': false
        };

        $scope.getCurrentGames = function(callback) {
            games.getCurrentGames(function() {
                $scope.games = [];
                $scope.games = games.currentGames;
                $scope.notifiedGames = games.notifiedGames;
                if (!$scope.silenceNotifs)
                    $scope.notifiedGamesCount = games.notifiedGames.length;
                $scope.currentOrPast = 'Current';
                if (callback)
                    callback();
            });
        };

        $scope.getPastGames = function(callback) {
            games.getPastGames(function() {
                $scope.games = games.pastGames;
                $scope.currentOrPast = 'Past';
                if (callback)
                    callback();
            });
        };

        $scope.newGame = function() {
            $state.go('home.preinterview');
        };

        $scope.findMyTurnGame = function(callback) {
            games.findMyTurnGame(function(myTurnGame) {
                callback(myTurnGame);
            });
        };

        $scope.goToNextGame = function() {
            $scope.findMyTurnGame(function(myTurnGame) {
                if (myTurnGame)
                    $location.path('/home/'+myTurnGame._id);
                else
                    $scope.newGame();
            });
        };

        $scope.hideNotifications = function() {
            $scope.silenceNotifs = true;
            $scope.notifiedGamesCount = 0;
        };

        $scope.clearNotifications = function() {
            $scope.notifiedGames = [];
            games.clearNotifications(function () {
                $scope.notifiedGamesCount = 0;
            });
        };
    
    }])

    // =========================================================================
    // Header
    // =========================================================================
    .controller('headerCtrl', [
        '$scope',
        'auth',
        function($scope, auth){
          $scope.isLoggedIn = auth.isLoggedIn;
          $scope.currentUser = auth.currentUser;
          $scope.logOut = auth.logOut;
          $scope.isGuest = auth.isGuest;

    }])

    // =========================================================================
    // Landing
    // =========================================================================
    .controller('landingCtrl', [
        '$scope',
        '$state',
        function($scope, $state){

        $scope.proceedAsGuest = function() {
            $scope.signUp.v = false;
            $state.go('consent');
        };

        $scope.proceedAsSignUp = function() {
            $scope.signUp.v = true;
            $state.go('consent');
        };

    }])

    // =========================================================================
    // Consent
    // =========================================================================
    .controller('consentCtrl', [
        '$scope',
        '$state',
        'auth',
        function($scope, $state, auth){

        $scope.proceedToRegister = function() {
            $scope.signUp.c = true;
            $state.go('register');   
        };

        $scope.proceedToRegisterGuest = function() {
            $scope.signUp.c = true;
            if (auth.isGuest()) {
                $state.go('registerGuest');    
            }
            else {
                auth.registerGuest(function(){
                $scope.signUp.c = true;
                $state.go('about');
            }); 
            }
        };

    }])

    //=================================================
    // Register
    //=================================================
    .controller('LoginCtrl', [
        '$scope',
        '$state',
        'auth',
        'md5',
        function($scope, $state, auth, md5){

          $scope.user = {};

          $scope.hashUser = function(user, callback) {
            // userCopy = angular.copy(user);
            // userCopy.username = md5.createHash(userCopy.username || '');
            // callback(userCopy);
            callback(angular.copy(user));
          };

          $scope.logIn = function(){
            $scope.hashUser($scope.user, function(user) {
                auth.logIn(user).error(function(error){
                  $scope.error = error;
                }).then(function(){
                  $state.go('home.new');
                });
            });
          };

        }])

    //=================================================
    // Register
    //=================================================
    .controller('RegisterCtrl', [
        '$scope',
        '$state',
        'auth',
        'md5',
        function($scope, $state, auth, md5){

          // need to consent before signing up
          if (!$scope.signUp.c) {
            $state.go('consent');
          }

          $scope.user = {};

          $scope.hashUser = function(user, callback) {
            // userCopy = angular.copy(user);
            // userCopy.username = md5.createHash(userCopy.username || '');
            // callback(userCopy);
            callback(angular.copy(user));
          };

          $scope.register = function(){
            $scope.hashUser($scope.user, function(user) {
                auth.register(user).error(function(error){
                  $scope.error = error;
                }).then(function(){
                  $state.go('about');
                });
            });
          };

          $scope.isGuest = auth.isGuest;

          $scope.saveGuest = function(){
            $scope.hashUser($scope.user, function(user) {
                auth.saveGuest(user).error(function(error){
                  $scope.error = error;
                }).then(function(){
                  $state.go('home.new');
                });
            });
          };

          $scope.registerMachine = function() {
            auth.registerMachine($scope.user, function(token){
                console.log(token);
            });    
          };

        }])



    //=================================================
    // Profile
    //=================================================

    .controller('profileCtrl', [
        '$scope', 
        'players',
        function($scope, players){

        $scope.letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z'];
        $scope.colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        var colorNames = [
              {id: '0', name: 'Black'},
              {id: '1', name: 'Brown'},
              {id: '2', name: 'Red'},
              {id: '3', name: 'Blue'},
              {id: '4', name: 'Purple'},
              {id: '5', name: 'Deep Purple'},
              {id: '6', name: 'Light Blue'},
              {id: '7', name: 'Cyan'},
              {id: '8', name: 'Teal'},
              {id: '9', name: 'Green'},
              {id: '10', name: 'Light Green'},
              {id: '11', name: 'Lime'},
              {id: '12', name: 'Yellow'},
              {id: '13', name: 'Amber'},
              {id: '14', name: 'Deep Orange'},
              {id: '15', name: 'Gray'},
              {id: '16', name: 'Indigo'}
            ];

        var letterOptions = [];
        for (var i=0; i<$scope.letters.length; i++)
            letterOptions.push({id: $scope.letters[i], name: $scope.letters[i]});
        
        $scope.player = players.player.player;
        $scope.joinDate = players.player.joinDate;

        $scope.myInitial = $scope.player.initial;
        $scope.myColor = $scope.player.color;

        $scope.colorData = {
            availableOptions: colorNames,
            selectedOption: {id: $scope.myColor, name: colorNames[$scope.myColor].name }
        };

        $scope.initialData = {
            availableOptions: letterOptions,
            selectedOption: {id: $scope.myInitial, name: $scope.myInitial }
        };

        $scope.getMaxRating = function(srHistory) {
            var maxRating = 0;
            for (var i=0; i<srHistory.length; i++) {
                if (srHistory[i].rating > maxRating)
                    maxRating = srHistory[i].rating;
            }
            return maxRating;
        };

        $scope.numWins = $scope.player.numWins;
        $scope.smartsRating = $scope.player.smartsRating;
        $scope.smartsRatingHistory = $scope.player.smartsRatingHistory;
        $scope.maxRating = $scope.getMaxRating($scope.smartsRatingHistory);
        $scope.winningStreak = $scope.player.winningStreak;
        $scope.winningStreakRecord = $scope.player.winningStreakRecord;
        $scope.totalGames = $scope.player.numGames;

        $scope.initialUpdate = function() {
            var initialData = $scope.initialData.selectedOption.id;
            players.initialUpdate(initialData, function(newInitial) {
                $scope.myInitial = newInitial;
            });
        };

        $scope.colorUpdate = function() {
            var colorData = $scope.colorData.selectedOption.id;
            players.colorUpdate(colorData, function(newColor) {
                $scope.myColor = newColor;
            });
        };

    }])


    //=================================================
    // Game
    //=================================================
    .controller('homeCtrl', [
        '$scope',
        'players',
        function($scope, players) {

        $scope.playerStats = {
            smartsRating: null,
            gameWins: 0
        };

        $scope.reloadPlayerStats = function(callback) {
            players.get();
            var player = players.player.player;

            $scope.playerStats.smartsRating = player.smartsRating;
            $scope.playerStats.gameWins = player.numWins;

            callback();
        };

        $scope.reloadPlayerStats(function() {});
    }])

    .controller('newCtrl', [
        '$scope',
        '$location',
        function($scope, $location){

        $scope.getCurrentGames(function() {
            $scope.findMyTurnGame(function(myTurnGame) {
                if (myTurnGame)
                    $location.path('/home/'+myTurnGame._id);
                else
                    $scope.newGame();
            });
        });
    }])

    .controller('gameCtrl', [
        '$scope',
        '$state',
        '$stateParams', 
        '$interval',
        'games',
        'game', 
        function($scope, $state, $stateParams, $interval, games, game){

        $scope.gameColor = game.color;
        $scope.gameInitial = game.initial;
        $scope.turn = game.turn;
        $scope.N = [0, 1, 2, 3, 4];
        $scope.active = game.active;

        $scope.phase = ($scope.active) ? game.phase : 7;

        $scope.goToPhase = function(phase, callback) {
            var nextState = 'home.game.final';
            if (phase < 2) {
                nextState = 'home.game.interview';
            }
            else if (phase < 4) {
                nextState = 'home.game.response';
            }
            else if (phase < 6) {
                nextState = 'home.game.guess';
            }
            $scope.phase = phase;
            $state.go(nextState).then(function() {
                $scope.reloadPlayerStats(callback);
            });
        };

        $scope.deactivateGame = function() {
            games.deactivate($stateParams.id, function() {
                $scope.active = 0;
                $scope.getPastGames(function () {});
            });
        };

        if ($scope.active) {
            $scope.getCurrentGames(function() {
                $scope.goToPhase($scope.phase);
            });
        }
        else {
            $scope.getPastGames(function() {
                $scope.goToPhase($scope.phase);
            });
        }

        $scope.gameUpdate = $interval(function() {
            var oldPhase = $scope.phase;
            if ($scope.active) {
                $scope.getCurrentGames(function() {
                    var thisGame;
                    for (var i=0; i<$scope.games.length; i++) {
                        thisGame = $scope.games[i];
                        if ($stateParams.id == thisGame._id)
                            break;
                        thisGame = false;
                    }
                    if (thisGame) {
                        var newPhase = thisGame.phase;
                        if (newPhase != oldPhase)
                            $scope.goToPhase(newPhase);
                    }
                    // game is finished
                    else {
                        $scope.getPastGames(function() {
                            $scope.goToPhase(7);
                        });
                    }
                });
            }
        }, 10000);

        $scope.$on("$destroy",function(){
            if (angular.isDefined($scope.gameUpdate)) {
                $interval.cancel($scope.gameUpdate);
            }
        });

    }])
    
    // Preinterview
    .controller('preinterviewCtrl', [
        '$scope',
        '$state',
        '$location',
        'growlService', 
        'auth',
        'games',
        function($scope, $state, $location, growlService, auth, games){

        $scope.N = [0, 1, 2, 3, 4];
        $scope.phase = 1;
        $scope.active = true;
        $scope.submitted = false;
        $scope.isNew = false;

        if (auth.isNew()) {
            growlService.growl('Your Luna Game has begun!');
            growlService.growl('Enter your interview questions.');
            $scope.isNew = true;
        }

        $scope.questions = [];
        $scope.submitted = false;

        $scope.o = {};
        $scope.o.oldQuestionsActive = false;

        $scope.o.findFirstEmptyQuestion = function(callback) {
            for (var i = 0; i<$scope.questions.length; i++) {
                if (!$scope.questions[i] || $scope.questions[i].length <= 0) {
                    callback(i);
                    return;
                }
            }
            if ($scope.questions.length == $scope.N.length)
                callback(-1);
            else
                callback($scope.questions.length);

        };

        $scope.upShift = function(idx) {
            if (idx <= 0)
                return;
            var tempQuestion = $scope.questions[idx];
            $scope.questions[idx] = $scope.questions[idx-1];
            $scope.questions[idx-1] = tempQuestion;
        };

        $scope.downShift = function(idx) {
            if (idx >= $scope.N.length-1)
                return;
            var tempQuestion = $scope.questions[idx];
            $scope.questions[idx] = $scope.questions[idx+1];
            $scope.questions[idx+1] = tempQuestion;
        };

        $scope.eraseQuestion = function(idx) {
            $scope.questions[idx] = '';
        };

        $scope.submitQuestions = function() {
            $scope.o.oldQuestionsActive = false;
            var questionReq = {
                questions: $scope.questions
            };
            games.addQuestions(questionReq, function(newGame) {
                if (newGame) {
                    $location.path('/home/'+newGame._id+'/interview');
                    $scope.getCurrentGames(function() {});
                }
                else {
                    growlService.growl("You may only have 8 active games.");
                }
            });
        };

        $scope.openOldQuestions = function() {
            $state.go('home.preinterview.oldquestions', { id: $scope.gameID });
            $scope.o.oldQuestionsActive = true;
        };

        $scope.o.closeOldQuestions = function () {
            $scope.o.oldQuestionsActive = false;
        };

    }])

    // Interview
    .controller('interviewCtrl', [
        '$scope',
        'auth',
        'games',
        'game', 
        function($scope, auth, games, game){

        $scope.gameID = game._id;
        $scope.questions = [];
        $scope.submitted = true;
        $scope.active = true;
        $scope.isNew = true;

        var savedQuestions = game.questions;

        for (var i=0; i<savedQuestions.length; i++) {
            $scope.questions[savedQuestions[i].questionNum] = savedQuestions[i].question.question;
        }

    }])

    // Response
    .controller('responseCtrl', [
        '$scope',
        '$stateParams',
        'growlService', 
        'games',
        'game', 
        function($scope, $stateParams, growlService, games, game){

        var opQuestions = game.opQuestions;
        var savedResponses = game.responses;

        $scope.questions = [];
        $scope.responses = [];
        $scope.submitted = false;

        if ($scope.phase > 1) {

            for (var i=0; i<opQuestions.length; i++) {
                $scope.questions[opQuestions[i].questionNum] = opQuestions[i].question.question;
            }

            for (var i=0; i<savedResponses.length; i++) {
                $scope.responses[savedResponses[i].questionNum] = savedResponses[i].response.response;

                // player has submitted responses already
                $scope.submitted = true;
            }

            $scope.submitResponses = function() {
                if (!$scope.submitted) {
                    $scope.submitted = true;
                    var responseReq = {
                        responses: $scope.responses
                    };
                    games.addResponses($stateParams.id, responseReq, function(data) {
                        $scope.goToPhase(data.phase, function() {
                            growlService.growl('Submitted responses!', 'inverse');
                        });
                    });
                }
            };

        }

    }])

    // Guess
    .controller('guessCtrl', [
        '$scope',
        '$stateParams',
        'growlService', 
        'games',
        'game', 
        function($scope, $stateParams, growlService, games, game){

        var myQuestions = game.questions;
        var opResponses = game.opResponses;
        var savedGuess = game.guess;

        $scope.gameID = game._id;
        $scope.questions = [];
        $scope.responses = [];
        $scope.submitted = false;
        $scope.responseGrades = [];

        $scope.o = {};
        $scope.o.guessCalculatorActive = false;

        if ($scope.phase > 3) {

            for (var i=0; i<myQuestions.length; i++) {
                $scope.questions[myQuestions[i].questionNum] = myQuestions[i].question.question;
            }

            for (var i=0; i<opResponses.length; i++) {
                $scope.responses[opResponses[i].questionNum] = opResponses[i].response.response;
            }

            if (savedGuess != null) {
                $scope.guess = savedGuess;

                // player has submitted a guess already
                $scope.submitted = true;
            }

            $scope.o.calculateGuess = function() {
                var total = 0.0;
                var changed = false;
                for (var i=0; i<$scope.o.guessInputs.length; i++) {
                    total += $scope.o.guessInputs[i];
                    var r = {
                        rid: opResponses[i].response._id, 
                        grade: $scope.o.guessInputs[i]
                    };
                    $scope.responseGrades.push(r);
                    if ($scope.o.guessInputs[i] != 50)
                        changed = true;
                }
                if (!changed) {
                    growlService.growl("First, slide the circles to estimate a guess.");
                    $scope.responseGrades = [];
                }
                else {
                    total /= $scope.o.guessInputs.length;
                    $scope.o.estimate = total;
                    $scope.guess = total;
                }
            }; 

            $scope.submitGuess = function() {
                if (!$scope.submitted) {
                    $scope.submitted = true;
                    var guessReq = {
                        guess: $scope.guess
                    };
                    games.addGuess($stateParams.id, guessReq, function(data) {
                        $scope.goToPhase(data.phase, function() {
                            growlService.growl('Submitted guess!', 'inverse');
                        });
                    });
                    if ($scope.responseGrades.length) {
                        games.saveResponseGrades($scope.responseGrades);
                    }
                }
            };

        }

    }])

    // Final
    .controller('finalCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        'auth',
        'games',
        'game', 
        function($scope, $state, $stateParams, auth, games, game){

        $scope.isNew = auth.isNew();

        if ($scope.phase >= 6) {
            $scope.myGuess = game.guess;
            $scope.opGuess = game.opGuess;
            $scope.outcome = game.outcome;
            $scope.smartsRating = game.smartsRating;
            $scope.opSmartsRating = game.opSmartsRating;
            $scope.oldSmartsRating = game.oldSmartsRating;
            $scope.opMachine = game.opMachine;

            if (games.current)
                games.deactivate($stateParams.id);

            auth.notNew();
        }

    }])

    // Old Questions
    .controller('oldquestionsCtrl', [
        '$scope',
        'growlService',
        'questions',
        function($scope, growlService, questions){

        $scope.oldQuestions = questions.oldQuestions;
        
        $scope.N = [0, 1, 2, 3, 4];
        $scope.o.oldQuestionsActive = true;

        $scope.o.addOldQuestion = function(q) {
            $scope.o.findFirstEmptyQuestion(function(idx) {
                if (idx < 0) {
                    growlService.growl('Erase an interview question first', 'inverse');
                }
                else {
                    $scope.questions[idx] = q;
                }
            });
        };

        questions.findOldQuestions();

    }])

    // Guess Calculator
    .controller('guessCalculatorCtrl', [
        '$scope',
        '$stateParams',
        '$timeout',
        'games',
        'game',
        function($scope, $stateParams, $timeout, games, game){

        $scope.o.guessCalculatorActive = true;

        $scope.o.guessInputs = [50, 50, 50, 50, 50];

    }])

