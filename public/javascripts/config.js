luna
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/home");


        $stateProvider
            
            //Home
            .state ('home', {
                abstract: true,
                url: '/home',
                templateUrl: 'views/home.html',
                controller: 'homeCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                  if(!auth.isLoggedIn()){
                    $state.go('login');
                  }
              }]
            })

            //New game
            .state('home.new', {
                url: '',
                templateUrl: 'views/new.html',
                controller: 'newCtrl'
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

            //Login
            .state('login', {
              url: '/login',
              templateUrl: 'views/login.html',
              controller: 'AuthCtrl',
              onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                  $state.go('home.new');
                }
              }]
            })

            //Register
            .state('register', {
              url: '/register',
              templateUrl: 'views/register.html',
              controller: 'AuthCtrl',
              onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                  $state.go('home.new');
                }
              }]
            });
    });
