luna
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/home");


        $stateProvider
            
            //Home
            .state ('home', {
                abstract: true,
                url: '/home',
                templateUrl: 'views/home.html',
                controller: 'homeCtrl'
            })

            //New game
            .state('home.new', {
                url: '',
                templateUrl: 'views/new.html'
            })

            //Game
            .state('home.game', {
                url: '/{id}',
                templateUrl: 'views/game.html',
                controller: 'gameCtrl',
                controllerAs: 'gctrl',
                resolve: {
                    game: ['$stateParams', 'games', function($stateParams, games) {
                      return games.get($stateParams.id);
                    }]
                  }
            })

            //Interview
            .state('home.game.interview', {
                url: '/interview',
                templateUrl: 'views/interview.html',
                controller: 'interviewCtrl'
            })

            //Response
            .state('home.game.response', {
                url: '/response',
                templateUrl: 'views/response.html'
            })

            //Guess
            .state('home.game.guess', {
                url: '/guess',
                templateUrl: 'views/guess.html'
            })

            //Final
            .state('home.game.final', {
                url: '/final',
                templateUrl: 'views/final.html'
            })
            
        
            //Profile
            .state ('profile', {
                url: '/profile/{id}',
                templateUrl: 'views/profile.html',
                controller: 'profileCtrl',
                controllerAs: 'pctrl',
                resolve: {
                    player: ['$stateParams', 'players', function($stateParams, players) {
                      return players.get($stateParams.id);
                    }]
                  }
            })
    });
