'use strict';

angular.module('mean.hieval', ['schemaForm'])
.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}])
.controller('HIEvalCrowdController', ['$scope', '$rootScope', '$stateParams', '$location', '$http', 'Global', 'HIEval', 'HIEvalUtil', 'MeanUser',
  function($scope, $rootScope, $stateParams, $location, $http, Global, HIEval, HIEvalUtil, MeanUser) {

    $scope.global = Global;

    $scope.consented = false;

    //var evalId = $stateParams.evalId;
    $scope.participantId = $stateParams.participantId;

    var queryObject = $location.search();

    var group = 'default';
    if (queryObject['group']) {
      group = queryObject['group'];
    }
    //console.log(queryObject);
    var evals = [];

    var next_eval = function (evalId) {
      //console.log(evalId);
      $http.get('hieval/assets/eval/' + evalId + '.json').success(function(data) {
        $scope.error = null;
        $scope.loading = false;
        $scope.schema = data.schema;
        $scope.form = data.form;
        $scope.response = {};
        $scope.evalId = evalId;
      }).error(function() {
        $scope.error = 'Failed to load...';
      });
    };

    $scope.siteUrl = null; // "http://google.com";

    $http.get('hieval/assets/eval/colon_cancer_sites.json').success(function(data) {
      var sites = data[group]['sites'];
      //console.log(group);
      $scope.siteUrl = sites[Math.floor(Math.random()*sites.length)];
      //console.log($scope.siteUrl);

      angular.forEach(data[group]['evals'], function(instrumentGroup, key) {
        var candidateInstruments = HIEvalUtil.shuffle(instrumentGroup['instruments']);
        var pick = instrumentGroup['pick'];
        candidateInstruments = candidateInstruments.slice(0,pick);

        for (var i = 0; i < candidateInstruments.length; i++) {
          this.push(candidateInstruments[i]);
        }
      }, evals);

      evals.push('final');
      //evals = ['accountability','final'];
      next_eval(evals.shift());

    }).error(function() {
      $scope.error = 'Failed to load the site...';
    });

    $scope.pretty = function(){
      return typeof $scope.response === 'string' ? $scope.response : JSON.stringify($scope.response, undefined, 2);
    };

    $scope.accept_consent = function() {
      $scope.consented = true;
      HIEval.track($scope.participantId, 'accepted_consent|' + $scope.siteUrl);

    };
    $rootScope.$on('tracklogged', function(event, participantTrack){
          $scope.participantId = participantTrack.participant._id;

          console.log($scope.participantId);
      });

    $scope.submit = function(form) {
      // First we broadcast an event so all fields validate themselves
      $scope.$broadcast('schemaFormValidate');
      // Then we check if the form is valid
      if (form.$valid) {
        HIEval.save($scope.evalId, $scope.participantId, group, $scope.siteUrl, JSON.stringify($scope.response));
      }
    };

    $rootScope.$on('responsesaved', function(event, saved_response){
        //$scope.participantId = saved_response.participant._id;

        //console.log(participantId);
        //console.log(JSON.stringify($scope.response));
        //console.log(evals);
        HIEval.track($scope.participantId, 'finished|' + $scope.siteUrl + '|' + $scope.evalId);
        if (evals.length > 0) {
          //console.log("next eval");
          var next_eval_id = evals.shift();

          //if (next_eval_id == 'final') {
            //HIEval.track($scope.participantId, 'finished|' + $scope.siteUrl + '|' + $scope.evalId);
          //}
          next_eval(next_eval_id);
        }
      });

    
    
    //console.log(evals);
  
  }
])

.controller('HIEvalBalancedCrowdController', ['$scope', '$rootScope', '$stateParams', '$location', '$http', 'Global', 'HIEval', 'HIEvalUtil', 'MeanUser',
  function($scope, $rootScope, $stateParams, $location, $http, Global, HIEval, HIEvalUtil, MeanUser) {

    $scope.global = Global;

    $scope.consented = false;

    //var evalId = $stateParams.evalId;
    $scope.participantId = $stateParams.participantId;

    var queryObject = $location.search();

    var group = 'default';
    if (queryObject['group']) {
      group = queryObject['group'];
    }

    var config = null;
    if (queryObject['config']) {
      config = queryObject['config'];
    }

    var type = 'public';
    if (queryObject['type']) {
      type = queryObject['type'];
    }

    var max = 3;
    if (queryObject['max']) {
      max = queryObject['max'];
    }

    var participantIdentifier = null;
    if (queryObject['participantIdentifier']) {
      participantIdentifier = queryObject['participantIdentifier'];
    }

    $scope.siteUrl = null; // "http://google.com";

    HIEval.next_eval(config, group, max, type);

    var evals = ['colon_cancer_demographics'];
    $rootScope.$on('nexteval', function(event, data){
        $scope.siteUrl = data.siteUrl; 

        evals.push(data.evalId);
        evals.push('final');

        next_eval(evals.shift());
    });

    var next_eval = function (evalId) {
      //console.log(evalId);
      $http.get('hieval/assets/eval/' + evalId + '.json').success(function(data) {
        $scope.error = null;
        $scope.loading = false;
        $scope.schema = data.schema;
        $scope.form = data.form;
        $scope.response = {};
        $scope.evalId = evalId;
      }).error(function() {
        $scope.error = 'Failed to load...';
      });
    };

    $scope.pretty = function(){
      return typeof $scope.response === 'string' ? $scope.response : JSON.stringify($scope.response, undefined, 2);
    };

    $scope.accept_consent = function() {
      $scope.consented = true;
      HIEval.track($scope.participantId, participantIdentifier, 'crowd', type, 'accepted_consent|' + $scope.siteUrl);

    };
    $rootScope.$on('tracklogged', function(event, participantTrack){
      $scope.participantId = participantTrack.participant._id;

    });

    $scope.submit = function(form) {
      // First we broadcast an event so all fields validate themselves
      $scope.$broadcast('schemaFormValidate');
      // Then we check if the form is valid
      if (form.$valid) {
        HIEval.save($scope.evalId, $scope.participantId, group, $scope.siteUrl, JSON.stringify($scope.response));
      }
    };

    $rootScope.$on('responsesaved', function(event, saved_response){
        //$scope.participantId = saved_response.participant._id;

        //console.log(participantId);
        //console.log(JSON.stringify($scope.response));
        //console.log(evals);
      HIEval.track($scope.participantId, participantIdentifier, 'crowd', type, 'finished|' + $scope.siteUrl + '|' + $scope.evalId);
      if (evals.length > 0) {
        //console.log("next eval");
        var next_eval_id = evals.shift();

        //if (next_eval_id == 'final') {
          //HIEval.track($scope.participantId, 'finished|' + $scope.siteUrl + '|' + $scope.evalId);
        //}
        next_eval(next_eval_id);
      }
    });

    
    
    //console.log(evals);
  
  }
])
.controller('HIEvalExpertController', ['$scope', '$rootScope', '$stateParams', '$location', '$http', 'Global', 'HIEval', 'HIEvalUtil', 'MeanUser',
  function($scope, $rootScope, $stateParams, $location, $http, Global, HIEval, HIEvalUtil, MeanUser) {

    $scope.global = Global;

    $scope.error = null;

    //var evalId = $stateParams.evalId;
    $scope.participantId = $stateParams.participantId;

    var queryObject = $location.search();

    $scope.siteUrl = null;
    if (queryObject['siteUrl']) {
      $scope.siteUrl = queryObject['siteUrl'];
    }

    console.log($scope.siteUrl);

    if (!$scope.siteUrl) {
      $scope.error = 'Missing siteUrl';
      return;
    }
    var group = 'treatment';

    
    var evals = [];

    var next_eval = function (evalId) {
      //console.log(evalId);
      $http.get('hieval/assets/eval/' + evalId + '.json').success(function(data) {
        $scope.error = null;
        $scope.loading = false;
        $scope.schema = data.schema;
        $scope.form = data.form;
        $scope.response = {};
        $scope.evalId = evalId;
      }).error(function() {
        $scope.error = 'Failed to load...';
      });
    };

    $scope.submit = function(form) {
      // First we broadcast an event so all fields validate themselves
      $scope.$broadcast('schemaFormValidate');
      // Then we check if the form is valid
      if (form.$valid) {
        HIEval.save($scope.evalId, $scope.participantId, group, $scope.siteUrl, JSON.stringify($scope.response));
      }
    };

    $rootScope.$on('tracklogged', function(event, participantTrack){
          $scope.participantId = participantTrack.participant._id;
      });

    $rootScope.$on('responsesaved', function(event, saved_response){
        //$scope.participantId = saved_response.participant._id;

        //console.log(participantId);
        //console.log(JSON.stringify($scope.response));
        //console.log(evals);
        HIEval.track($scope.participantId, expert, 'expert', 'expert', 'finished|' + $scope.siteUrl + '|' + $scope.evalId);
        if (evals.length > 0) {
          //console.log("next eval");
          var next_eval_id = evals.shift();

          //if (next_eval_id == 'final') {
            //HIEval.track($scope.participantId, 'finished|' + $scope.siteUrl + '|' + $scope.evalId);
          //}

          next_eval(next_eval_id);
        }
      });

    var expert = null;

    if (queryObject['expert']) {
      expert = queryObject['expert'];

      $http.get('hieval/assets/eval/' + expert + '_sites.json').success(function(data) {

        //["discern_short_form", "overall", "final"];

        angular.forEach(data[group]['evals'], function(instrumentGroup, key) {

          var candidateInstruments = instrumentGroup['instruments'];
          
          var pick = instrumentGroup['pick'];
          if (pick != 'all') {

            candidateInstruments = HIEvalUtil.shuffle(candidateInstruments);
            candidateInstruments = candidateInstruments.slice(0,pick);
          }
          
          for (var i = 0; i < candidateInstruments.length; i++) {
            this.push(candidateInstruments[i]);
          }

        }, evals);

        HIEval.track(null, expert, 'expert', 'expert', expert + '|started|' + $scope.siteUrl);
        next_eval(evals.shift());

      }).error(function() {
        $scope.error = 'Failed to load instruments';
      });
      
    }else{
      $scope.error = 'Failed to identify the expert...';
    }
   
  }
])
.controller('HIEvalExpertListController', ['$scope', '$rootScope', '$stateParams', '$location', '$http', 'Global', 'HIEval', 'HIEvalUtil', 'MeanUser',
  function($scope, $rootScope, $stateParams, $location, $http, Global, HIEval, HIEvalUtil, MeanUser) {

    $scope.global = Global;

    $scope.error = null;


    var queryObject = $location.search();

    $scope.expert = null;

    if (queryObject['expert']) {
      $scope.expert = queryObject['expert'];
    }else{
      $scope.error = "no expert identified...";
      return;
    }

    var group = null;

    if (queryObject['group']) {
      group = queryObject['group'];
    }else{
      $scope.error = "no group identified...";
      return;
    }

    $scope.sites = null;
    $scope.instruments = [];

    
    $http.get('hieval/assets/eval/' + $scope.expert + '_sites.json').success(function(data) {

      $scope.sites = data[group]['sites'];

      angular.forEach(data[group]['evals'], function(instrumentGroup, key) {

          var candidateInstruments = instrumentGroup['instruments'];
          
          var pick = instrumentGroup['pick'];
          if (pick != 'all') {

            candidateInstruments = HIEvalUtil.shuffle(candidateInstruments);
            candidateInstruments = candidateInstruments.slice(0,pick);
          }
          
          for (var i = 0; i < candidateInstruments.length; i++) {
            this.push(candidateInstruments[i]);
          }

        }, $scope.instruments);


    }).error(function() {
      $scope.error = 'Failed to load...';
    });

   
  }
]);