'use strict';

angular.module('pdCommon')
  .directive('pdAuth', function (auth) {
    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'views/directives/auth.html',
      link: function (scope) {
        scope.isAuthenticated = auth.isAuthenticated;
      }
    };
  })
;
