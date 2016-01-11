luna
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('lunaCtrl', [
        '$timeout',
        '$state',
        '$scope',
        '$location',
        'games',
        function($timeout, $state, $scope, $location, games){
        
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

        $scope.getCurrentGames = function(callback) {
            games.getCurrentGames(function() {
                $scope.games = games.currentGames;
                $scope.notifiedGames = games.notifiedGames;
                if (!$scope.silenceNotifs)
                    $scope.notifiedGamesCount = games.notifiedGames.length;
                $scope.currentOrPast = 'Current';
                callback();
            });
        };

        $scope.getPastGames = function(callback) {
            games.getPastGames(function() {
                $scope.games = games.pastGames;
                $scope.currentOrPast = 'Past';
                callback();
            });
        };

        $scope.newGame = function() {
            games.create(function(newGame) {
                $location.path('/home/'+newGame._id);
                $scope.getCurrentGames();
            });
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

    }])

    //=================================================
    // Auth
    //=================================================
    .controller('AuthCtrl', [
        '$scope',
        '$state',
        'auth',
        'md5',
        function($scope, $state, auth, md5){
          $scope.user = {};

          $scope.hashUser = function(user, callback) {
            userCopy = angular.copy(user);
            userCopy.username = md5.createHash(userCopy.username || '');
            callback(userCopy);
          };

          $scope.register = function(){
            $scope.hashUser($scope.user, function(user) {
                auth.register(user).error(function(error){
                  $scope.error = error;
                }).then(function(){
                  $state.go('home.new');
                });
            });
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
    .controller('newCtrl', [
        '$scope',
        '$location',
        function($scope, $location){

        $scope.getCurrentGames(function() {
            $scope.findMyTurnGame(function(myTurnGame) {
                if (myTurnGame)
                    $location.path('/home/'+myTurnGame._id);
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
            $state.go(nextState).then(callback);
        };

        $scope.deactivateGame = function() {
            games.deactivate($stateParams.id, function() {
                $scope.active = 0;
                $scope.getPastGames();
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
            if ($scope.active) {
                $scope.getCurrentGames(function() {});
            }
        }, 10000);

        $scope.$on("$destroy",function(){
            if (angular.isDefined($scope.gameUpdate)) {
                $interval.cancel($scope.gameUpdate);
            }
        });

    }])

    // Interview
    .controller('interviewCtrl', [
        '$scope',
        '$stateParams',
        'growlService', 
        'games',
        'game', 
        function($scope, $stateParams, growlService, games, game){

        $scope.questions = [];
        $scope.submitted = false;

        var savedQuestions = game.questions;

        for (var i=0; i<savedQuestions.length; i++) {
            $scope.questions[savedQuestions[i].questionNum] = savedQuestions[i].question;

            // player has submitted questions already
            $scope.submitted = true;
        }

        $scope.submitQuestions = function() {
            $scope.submitted = true;
            var questionReq = {
                questions: $scope.questions
            };
            games.addQuestions($stateParams.id, questionReq, function(data) {
                $scope.goToPhase(data.phase, function() {
                    growlService.growl('Submitted questions!', 'inverse');
                });
            });
        };

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
                $scope.questions[opQuestions[i].questionNum] = opQuestions[i].question;
            }

            for (var i=0; i<savedResponses.length; i++) {
                $scope.responses[savedResponses[i].questionNum] = savedResponses[i].response;

                // player has submitted responses already
                $scope.submitted = true;
            }

            $scope.submitResponses = function() {
                $scope.submitted = true;
                var responseReq = {
                    responses: $scope.responses
                };
                games.addResponses($stateParams.id, responseReq, function(data) {
                    $scope.goToPhase(data.phase, function() {
                        growlService.growl('Submitted responses!', 'inverse');
                    });
                });
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

        $scope.questions = [];
        $scope.responses = [];
        $scope.submitted = false;

        if ($scope.phase > 3) {

            for (var i=0; i<myQuestions.length; i++) {
                $scope.questions[myQuestions[i].questionNum] = myQuestions[i].question;
            }

            for (var i=0; i<opResponses.length; i++) {
                $scope.responses[opResponses[i].questionNum] = opResponses[i].response;
            }

            if (savedGuess != null) {
                $scope.guess = savedGuess;

                // player has submitted a guess already
                $scope.submitted = true;
            }

            $scope.submitGuess = function() {
                $scope.submitted = true;
                var guessReq = {
                    guess: $scope.guess
                };
                games.addGuess($stateParams.id, guessReq, function(data) {
                    $scope.goToPhase(data.phase, function() {
                        growlService.growl('Submitted guess!', 'inverse');
                    });
                });
            };

        }

    }])

    // Final
    .controller('finalCtrl', [
        '$scope',
        '$stateParams',
        'games',
        'game', 
        function($scope, $stateParams, games, game){

        if ($scope.phase >= 6) {
            $scope.myGuess = game.guess;
            $scope.opGuess = game.opGuess;
            $scope.outcome = game.outcome;
            $scope.smartsRating = game.smartsRating;
            $scope.opSmartsRating = game.opSmartsRating;
            $scope.oldSmartsRating = game.oldSmartsRating;

            if (games.current)
                games.deactivate($stateParams.id, function() {});

        }

    }])
