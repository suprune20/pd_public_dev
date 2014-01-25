'use strict';

angular.module('pdApp')
  .controller('MainCtrl', function ($scope, $ocLazyLoad, $location) {
    $scope.ololo = function () {
      $ocLazyLoad.load('pdFrontend')
        .then(function() {
          console.log('done');
          $location.path('/catalog');
        });
    };
  })
;
