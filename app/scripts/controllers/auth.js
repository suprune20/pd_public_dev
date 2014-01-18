'use strict';

angular.module('pdApp')
  .controller('AuthSigninCtrl', function ($scope, auth, $location) {
    $scope.signin = function () {
      auth.signin($scope.username, $scope.password)
        .then(function () {
          $location.path('/');
        }, function (errorMessage) {
          $scope.password = '';
          $scope.errorMessage = errorMessage;
        });
    };
  })
;
