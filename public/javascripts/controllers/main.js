luna
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('lunaCtrl', function($timeout, $state, $scope, growlService){
        //Welcome Message
        growlService.growl('Welcome back Tom!', 'inverse')
        
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
    
    })

    // =========================================================================
    // Header
    // =========================================================================
    .controller('headerCtrl', function(){

    })

    .controller('homeCtrl', [
        '$scope',
        '$location',
        'games',
        function($scope, $location, games){

        $scope.playerID = { playerID: "568d621f237a26700ffe0379" };

        $scope.newGame = function() {
            games.create($scope.playerID, function(newGame) {
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

        $scope.phase = 0;
        $scope.player = null;
        $scope.N = [0, 1, 2, 3, 4];
        $scope.questions = [];
        $scope.submitted = false;

        for (var i=0; i<game.questions1.length; i++) {
            $scope.questions[game.questions1[i].questionNum] = game.questions1[i].question;
        }

        $scope.changePhase = function(phase) {
            var nextState = 'home.game.final';
            if (phase < 3) {
                nextState = 'home.game.interview';
            }
            else if (phase < 5) {
                nextState = 'home.game.response';
            }
            else if (phase < 7) {
                nextState = 'home.game.guess';
            }
            $scope.phase = phase;
            $state.go(nextState);
        };

        $scope.submitQuestions = function() {
            $scope.submitted = true;
            games.addQuestions($stateParams.id, $scope.questions);
            $scope.changePhase($scope.phase+1);
        };

        $scope.changePhase(game.phase);

    }])
