luna
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $uiViewScrollProvider){
        $urlRouterProvider.otherwise("/landing");

        $uiViewScrollProvider.useAnchorScroll();

        $stateProvider
            
            //Home
            .state ('home', {
                abstract: true,
                url: '/home',
                templateUrl: 'views/home.html',
                controller: 'homeCtrl',
                resolve: {
                  player: ['players', function(players) {
                    return players.get();
                  }]
                },
                onEnter: ['$state', 'auth', function($state, auth){
                  if(!auth.isLoggedIn()){
                    $state.go('login');
                  }
              }]
            })

            //Default home
            .state('home.new', {
              url: '/new',
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

            //Old Questions
            .state('home.game.interview.oldquestions', {
                url: '/oldquestions',
                templateUrl: 'views/oldquestions.html',
                controller: 'oldquestionsCtrl',
                resolve: {
                    game: ['$stateParams', 'questions', 'games', function($stateParams, questions, games) {
                      questions.findOldQuestions();
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

            //Guess Calculator
            .state('home.game.guess.guessCalculator', {
                url: '/guessCalculator',
                templateUrl: 'views/guessCalculator.html',
                controller: 'guessCalculatorCtrl',
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

            //Contact
            .state('contact', {
                url: '/contact',
                templateUrl: 'views/contact.html'
            })

            //Landing
            .state('landing', {
                url: '/landing',
                templateUrl: 'views/landing.html',
                controller: 'landingCtrl'
            })

            //About
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html'
            })

            //Strategy
            .state('strategy', {
                url: '/strategy',
                templateUrl: 'views/strategy.html'
            })

            //Test for AI
            .state('testForAI', {
                url: '/testForAI',
                templateUrl: 'views/testForAI.html'
            })
            
        
            //Profile
            .state ('profile', {
                url: '/profile',
                templateUrl: 'views/profile.html',
                controller: 'profileCtrl',
                resolve: {
                  player: ['players', function(players) {
                    return players.get();
                  }]
                },
                onEnter: ['$state', 'auth', function($state, auth){
                  if(!auth.isLoggedIn()){
                    $state.go('login');
                  }
                }]
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
            })

            //Register Guest
            .state('registerGuest', {
              url: '/registerGuest',
              templateUrl: 'views/registerGuest.html',
              controller: 'AuthCtrl',
              onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isGuest()){
                  $state.go('register');
                }
              }]
            })

            //Register Machine
            .state('registerMachine', {
              url: '/registerMachine',
              templateUrl: 'views/registerMachine.html',
              controller: 'AuthCtrl'
            })

            //404
            .state('404', {
              url: '/404',
              templateUrl: 'views/404.html'
            })
    });
