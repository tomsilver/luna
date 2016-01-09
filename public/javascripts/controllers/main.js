luna
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('lunaCtrl', function($timeout, $state, $scope, growlService){
        //Welcome Message
        growlService.growl('Welcome back Tom!', 'inverse');
        
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

        $scope.player = { _id: "568c52ded4566fa60b760937" };

        // 568d621f237a26700ffe0379
        // 568c52ded4566fa60b760937
    
    })

    // =========================================================================
    // Header
    // =========================================================================
    .controller('headerCtrl', function(){

    })


    //=================================================
    // Home
    //=================================================
    .controller('homeCtrl', [
        '$scope',
        '$location',
        'games',
        function($scope, $location, games){

        games.getAll(function() {
            $scope.games = games.games;
            $scope.$watch('games', function (newVal) {console.log("game updated");}, true);
        });


        $scope.newGame = function() {
            games.create($scope.player, function(newGame) {
                $location.path('/home/'+newGame._id);
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

        $scope.phase = game.phase;

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

        $scope.goToPhase(game.phase);

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
        'game', 
        function($scope, $stateParams, game){

        if ($scope.phase == 6) {
            $scope.opGuess = game.guess;
            $scope.myGuess = game.opGuess;
        }

    }])
