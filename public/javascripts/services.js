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

    .factory('games', ['$http', function($http){
      var o = {
        games: [],
        myQuestions: [],
        opQuestions: [],
        myResponses: [],
        opResponses: [],
        myGuess: null,
        opGuess: null
      };

      o.create = function(player, callback) {
        return $http.post('/home', player).success(function(data){
          o.games.push(data);
          callback(data);
        });
      };

      o.get = function(id) {
        return $http.get('/home/' + id).then(function(res){
          return res.data;
        });
      };

      o.addQuestions = function(id, questions, callback) {
        return $http.post('/home/'+ id +'/interview', questions).success(function(data){
          o.myQuestions = data.questions;
          callback(data.nextPhase);
        });
      };

      o.addResponses = function(id, responses, callback) {
        return $http.post('/home/'+ id +'/response', responses).success(function(data){
          o.myResponses = data.responses;
          callback(data.nextPhase);
        });
      };

      o.addGuess = function(id, guess, callback) {
        return $http.post('/home/'+ id +'/guess', guess).success(function(data){
          o.myGuess = data.guess;
          callback(data.nextPhase);
        });
      };

      return o;
    }])


