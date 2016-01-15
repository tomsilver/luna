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

    .factory('players', ['$http', 'auth', function($http, auth){
      var o = {
        player: null
      };

      o.get = function() {
        return $http.get('/profile', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
          o.player = res.data;
          return res.data;
        });
      };

      o.initialUpdate = function(initial, callback) {
        return $http.post('/profile/initial', {initial: initial}, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
          o.player.initial = res.data;
          callback(res.data);
        });

      };

      o.colorUpdate = function(color, callback) {
        return $http.post('/profile/color', {color: parseInt(color)}, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
          o.player.color = res.data;
          callback(res.data);
        });
      };

      return o;
    }])

    //==============================================
    // Games
    //==============================================

    .factory('games', ['$http', 'auth', function($http, auth){
      var o = {
        currentGames: [],
        pastGames: [],
        notifiedGames: [],
        current: true
      };

      o.updateGame = function(id, game, callback) {
        var savedGame;
        var theseGames = (o.current) ? o.currentGames : o.pastGames;

        for (var i=0; i<theseGames.length; i++) {
          if (theseGames[i]._id == id) {
            savedGame = theseGames[i];
            break;
          }
        }

        if (!savedGame)
          console.log("Error: saved game not found");

        theseGames[i] = game;

        callback(game);

      };

      /* move a game from current to past */
      o.retireGame = function(id, game, callback) {
        var savedGameIdx;

        for (var i=0; i<o.currentGames.length; i++) {
          if (o.currentGames[i]._id == id) {
            savedGameIdx = i;
            break;
          }
        }

        if (savedGameIdx) {
          o.currentGames.splice(savedGameIdx, 1);
          o.pastGames.unshift(game);
        }

        callback();

      };

      o.getAll = function(callback) {
        return $http.get('/home', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          callback(data);
        });
      };

      o.getCurrentGames = function(callback) {
        o.current = true;
        o.currentGames = [];
        o.notifiedGames = [];
        o.getAll(function(games) {
          for (var i=0; i<games.length; i++) {
            if (games[i].active)
              o.currentGames.push(games[i]);
            if (games[i].notif)
              o.notifiedGames.push(games[i]);
          }
          callback();
        });
      };

      o.getPastGames = function(callback) {
        o.current = false;
        o.pastGames = [];
        o.getAll(function(games) {
          for (var i=0; i<games.length; i++) {
            if (!games[i].active)
              o.pastGames.push(games[i]);
          }
          callback();
        });
      };

      o.clearNotifications = function(callback) {
        o.notifiedGames = [];
        return $http.delete('/notifs', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          callback();
        });;
      };

      o.create = function(callback) {
        return $http.post('/home', {}, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          o.currentGames.push(data);
          callback(data);
        });
      };

      o.findMyTurnGame = function(callback) {
        var myTurnGame = false;
        
        for (var i=0; i<o.currentGames.length; i++) {
          if (o.currentGames[i].turn == 1) {
            myTurnGame = o.currentGames[i];
            break;
          }
        }
        
        callback(myTurnGame);
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

      o.deactivate = function(id, callback) {
        return $http.get('/home/' + id + '/deactivate', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(game){
          o.retireGame(id, game, callback);
        });
      };

      o.saveResponseGrades = function(responseGrades, callback) {
        return $http.put('/home/responseGrades', responseGrades, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(){
          if (callback)
            callback();
        });
      };

      return o;
    }])

    //==============================================
    // Questions
    //==============================================

    .factory('questions', ['$http', 'auth', function($http, auth){
      var o = {
        oldQuestions: []
      };

      o.findOldQuestions = function(callback) {
        return $http.get('/oldquestions', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          o.oldQuestions = data;
          if (callback)
            callback(data);
        });
      };

      return o;
    }])


    //==============================================
    // Auth
    //==============================================

    .factory('auth', ['$http', '$window', '$state', function($http, $window, $state){
      var auth = {};

      auth.saveToken = function (token, isGuest, callback){
        console.log(isGuest);
        $window.localStorage['luna-token'] = token;
        $window.localStorage['luna-is-guest'] = isGuest;
        callback();
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
        return false;
      };

      auth.isGuest = function() {
        var g = true;
        g = g && $window.localStorage['luna-is-guest'];
        g = g && ($window.localStorage['luna-is-guest'] !== 'false');
        console.log(g);
        return g;
      };

      auth.register = function(user){
        return $http.post('/register', user).success(function(data){
          auth.saveToken(data.token, false, function(){});
        });
      };

      auth.registerGuest = function(callback){
        return $http.get('/registerGuest').success(function(data){
          auth.saveToken(data.token, true, callback);
        });
      };

      auth.saveGuest = function(user){
        return $http.post('/saveGuest', user, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          auth.saveToken(data.token, false, function(){});
        });
      };

      auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
          auth.saveToken(data.token, false, function(){});
        });
      };

      auth.logOut = function(){
        $window.localStorage.removeItem('luna-token');
        $window.localStorage.removeItem('luna-is-guest');
        $state.go('login');
      };

      return auth;
    }])


