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
                  player: ['$state', 'auth', 'players', function($state, auth, players) {
                    if(!auth.isLoggedIn()){
                      $state.go('login');
                    }
                    else {
                      return players.get();
                    }
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

            //Pre Interview
            .state('home.preinterview', {
                url: '/interview',
                templateUrl: 'views/pinterview.html',
                controller: 'preinterviewCtrl'
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
            .state('home.preinterview.oldquestions', {
                url: '/oldquestions',
                templateUrl: 'views/oldquestions.html',
                controller: 'oldquestionsCtrl',
                resolve: {
                    oldQuestions: ['questions', function(questions) {
                      return questions.findOldQuestions();
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

            //Landing
            .state('consent', {
                url: '/consent',
                templateUrl: 'views/consent.html',
                controller: 'consentCtrl'
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
              controller: 'LoginCtrl',
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
              controller: 'RegisterCtrl',
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
              controller: 'RegisterCtrl',
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
              controller: 'RegisterCtrl'
            })

            //404
            .state('404', {
              url: '/404',
              templateUrl: 'views/404.html'
            })
    });
