'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.hieval').factory('HIEval', ['$http', '$rootScope',
  function($http, $rootScope) {
  	var self;

  	function HIEvalKlass(){
  		self = this;
  	};

    HIEvalKlass.prototype.track = function(participantId, participantIdentifier, participantSource, participantType, event) {
      var url = '/api/hieval/track/' + participantId;

      $http.post(url, {
        participantId: participantId,
        participantIdentifier: participantIdentifier,
        participantSource: participantSource,
        participantType: participantType,
        event: event
        })
        .success(function(data){
          //console.log(data);

          $rootScope.$emit('tracklogged', data);
        })
        .error(function(r){
          //console.log(r);
        });
    };

    HIEvalKlass.prototype.find_participant_by_identifier = function(participantIdentifier) {
        var url = '/api/hieval/found_participant_by_identifier/' + participantIdentifier;

        $http.post(url, {
          identifier: participantIdentifier
          })
          .success(function(participant){
            //console.log(data);

            $rootScope.$emit('participantfound', participant);
          })
          .error(function(r){
            $rootScope.$emit('participantfound', null);
          });
      };

  	HIEvalKlass.prototype.save = function(evalId, participantId, group, siteUrl, responseJsonString) {
        //console.log(responseJsonString);

        var url = '/api/hieval/evals/' + evalId + "/participants/" + participantId;

        $http.post(url, {
          response: responseJsonString,
          siteUrl: siteUrl,
          group: group
        })
          .success(function(data){
            //console.log(data);

            $rootScope.$emit('responsesaved', data);
          })
          .error(function(r){
            //console.log(r);
          });
      };

    HIEvalKlass.prototype.next_eval = function(config, group, max, type) {
        var url = '/api/hieval/evals/next_eval';

        $http.post(url, {
          config: config,
          group: group,
          max: max,
          type: type
          })
          .success(function(data){
            
            $rootScope.$emit('nexteval', data);
            
          })
          .error(function(r){
            $rootScope.$emit('nexteval', null);
          });
      };

    var HIEval = new HIEvalKlass();

    return HIEval;
  }
])
.factory('HIEvalUtil', ['$rootScope', function($rootScope){

  var self;

  function HIEvalUtilKlass(){
    self = this;
  };

  HIEvalUtilKlass.prototype.shuffle = function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    };

  var HIEvalUtil = new HIEvalUtilKlass();

  return HIEvalUtil;

}]);
