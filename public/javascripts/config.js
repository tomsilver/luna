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
                controller: 'interviewCtrl',
                resolve: {
                    game: ['$stateParams', 'games', function($stateParams, games) {
                      return games.get($stateParams.id);
                    }]
                  }
            })

            //Response
            .state('home.game.response', {
                url: '/response',
                templateUrl: 'views/response.html',
                controller: 'responseCtrl',
                resolve: {
                    game: ['$stateParams', 'games', function($stateParams, games) {
                      return games.get($stateParams.id);
                    }]
                  }
            })

            //Guess
            .state('home.game.guess', {
                url: '/guess',
                templateUrl: 'views/guess.html',
                controller: 'guessCtrl',
                resolve: {
                    game: ['$stateParams', 'games', function($stateParams, games) {
                      return games.get($stateParams.id);
                    }]
                  }
            })

            //Final
            .state('home.game.final', {
                url: '/final',
                templateUrl: 'views/final.html',
                controller: 'finalCtrl',
                resolve: {
                    game: ['$stateParams', 'games', function($stateParams, games) {
                      return games.get($stateParams.id);
                    }]
                  }
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
