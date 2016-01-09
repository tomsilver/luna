luna
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('lunaCtrl', function($timeout, $state, $scope){
        
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
        ]

        this.skinSwitch = function (color) {
            this.currentSkin = color;
        }

        $scope.player = { _id: "568d621f237a26700ffe0379" };

        // 568d621f237a26700ffe0379
        // 568c52ded4566fa60b760937
    
    })

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
    // Home
    //=================================================
    .controller('homeCtrl', [
        '$scope',
        '$location',
        'games',
        function($scope, $location, games){

        $scope.currentOrPast = 'Current';

        $scope.getCurrentGames = function() {
            games.getCurrentGames(function() {
                $scope.games = games.currentGames;
                $scope.currentOrPast = 'Current';
            });
        };

        $scope.getPastGames = function() {
            games.getPastGames(function() {
                $scope.games = games.pastGames;
                $scope.currentOrPast = 'Past';
            });
        };

        $scope.newGame = function() {
            games.create($scope.player, function(newGame) {
                $location.path('/home/'+newGame._id);
                $scope.getCurrentGames();
            });
        };

        $scope.getCurrentGames();

    }])

    //=================================================
    // Auth
    //=================================================
    .controller('AuthCtrl', [
        '$scope',
        '$state',
        'auth',
        function($scope, $state, auth){
          $scope.user = {};

          $scope.register = function(){
            auth.register($scope.user).error(function(error){
              $scope.error = error;
            }).then(function(){
              $state.go('home.new');
            });
          };

          $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
              $scope.error = error;
            }).then(function(){
              $state.go('home.new');
            });
          };
        }])



    //=================================================
    // Profile
    //=================================================

    .controller('profileCtrl', [
        '$scope', 
        'players',
        'player', 
        function($scope, players, player){
        
        //Get Profile Information from profileService Service
        
        //User    
        $scope.fullName = player.name;
        $scope.joinDate = player.joinDate;
        $scope.emailAddress = "tomssilver@gmail.com";
        $scope.numWins = 24;
        $scope.smartsRating = 82;

    }])

    //=================================================
    // Game
    //=================================================

    .controller('gameCtrl', [
        '$scope',
        '$state',
        '$stateParams', 
        'games',
        'game', 
        function($scope, $state, $stateParams, games, game){

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
            games.deactivate($stateParams.id, $scope.getPastGames);
        };

        $scope.goToPhase($scope.phase);

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
                questions: $scope.questions,
                player: $scope.player
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
                    responses: $scope.responses,
                    player: $scope.player
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
                    guess: $scope.guess,
                    player: $scope.player
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

        $scope.myGuess = 'None';
        $scope.opGuess = 'None';

        if ($scope.phase >= 6) {
            $scope.myGuess = game.guess;
            $scope.opGuess = game.opGuess;

            if (games.current)
                games.deactivate($stateParams.id);
        }

    }])
