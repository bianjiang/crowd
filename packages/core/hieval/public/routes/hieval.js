'use strict';

//Setting up route
angular.module('mean.hieval').config(['$stateProvider',
  function($stateProvider) {

    // states for my app
    $stateProvider
      .state('crowd eval by id', {
        url: '/hieval/crowd/:evalId',
        templateUrl: '/hieval/views/crowd_view.html'
      })
      .state('balanced crowd eval by id', {
        url: '/hieval/balanced_crowd/:evalId',
        templateUrl: '/hieval/views/balanced_crowd_view.html'
      })
      .state('expert eval by id', {
        url: '/hieval/expert/:evalId',
        templateUrl: '/hieval/views/expert_view.html'
      })
      .state('expert eval list', {
        url: '/hieval/expert_eval_list/:evalId',
        templateUrl: '/hieval/views/expert_eval_list.html'
      });
  }
]);
