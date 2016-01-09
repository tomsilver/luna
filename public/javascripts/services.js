luna

    //==============================================
    // BOOTSTRAP GROWL
    //==============================================

    .service('growlService', function(){
        var gs = {};
        gs.growl = function(message, type) {
            $.growl({
                message: message
            },{
                type: type,
                allow_dismiss: false,
                label: 'Cancel',
                className: 'btn-xs btn-inverse',
                placement: {
                    from: 'top',
                    align: 'right'
                },
                delay: 2500,
                animate: {
                        enter: 'animated bounceIn',
                        exit: 'animated bounceOut'
                },
                offset: {
                    x: 20,
                    y: 85
                }
            });
        }
        
        return gs;
    })

    //==============================================
    // Players
    //==============================================

    .factory('players', ['$http', function($http){
      var o = {
        player: null
      };

      o.create = function(player) {
        return $http.post('/profile', player).success(function(data){
          o.player = data;
        });
      };

      o.get = function(id) {
        return $http.get('/profile/' + id).then(function(res){
          return res.data;
        });
      };

      return o;
    }])

    //==============================================
    // Games
    //==============================================

    .factory('games', ['$http', 'auth', function($http, auth){
      var o = {
        games: []
      };

      o.updateGame = function(id, game, callback) {
        var savedGame = false;

        for (var i=0; i<o.games.length; i++) {
          if (o.games[i]._id == id) {
            savedGame = o.games[i];
            break;
          }
        }

        if (!savedGame)
          console.log("Error: saved game not found");

        o.games[i] = game;

        callback(game);

      };

      o.getAll = function(callback) {
        return $http.get('/home', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          o.games = data;
          callback();
        });
      };

      o.create = function(player, callback) {
        return $http.post('/home', player, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          o.games.push(data);
          callback(data);
        });
      };

      o.get = function(id) {
        return $http.get('/home/' + id, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
          return res.data;
        });
      };

      o.addQuestions = function(id, questions, callback) {
        return $http.post('/home/'+ id +'/interview', questions, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(game){
          o.updateGame(id, game, callback);
        });
      };

      o.addResponses = function(id, responses, callback) {
        return $http.post('/home/'+ id +'/response', responses, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(game){
          o.updateGame(id, game, callback);
        });
      };

      o.addGuess = function(id, guess, callback) {
        return $http.post('/home/'+ id +'/guess', guess, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(game){
          o.updateGame(id, game, callback);
        });
      };

      return o;
    }])

    .factory('auth', ['$http', '$window', '$state', function($http, $window, $state){
      var auth = {};

      auth.saveToken = function (token){
        $window.localStorage['luna-token'] = token;
      };

      auth.getToken = function (){
        return $window.localStorage['luna-token'];
      };

      auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
          var payload = JSON.parse($window.atob(token.split('.')[1]));

          return payload.exp > Date.now() / 1000;
        } else {
          return false;
        }
      };

      auth.currentUser = function(){
        if(auth.isLoggedIn()){
          var token = auth.getToken();
          var payload = JSON.parse($window.atob(token.split('.')[1]));

          return payload.username;
        }
      };

      auth.register = function(user){
        return $http.post('/register', user).success(function(data){
          auth.saveToken(data.token);
        });
      };

      auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
          auth.saveToken(data.token);
        });
      };

      auth.logOut = function(){
        $window.localStorage.removeItem('luna-token');
        console.log("logged out");
        $state.go('login')
      };

      return auth;
    }])


