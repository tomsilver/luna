luna
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/pages/home");


        $stateProvider
            
            //------------------------------
            // PAGES
            //------------------------------
            
            .state ('pages', {
                url: '/pages',
                templateUrl: 'views/common.html'
            })

            //Home

            .state ('pages.home', {
                url: '/home',
                templateUrl: 'views/home.html'
            })
            
        
            //Profile
        
            .state ('pages.profile', {
                url: '/profile',
                templateUrl: 'views/profile.html'
            })
    });
