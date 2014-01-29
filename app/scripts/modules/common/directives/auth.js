'use strict';

angular.module('pdCommon')
  .directive('pdAuth', function (auth) {
    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'views/modules/common/directives/auth.html',
      link: function (scope) {
        scope.isAuthenticated = auth.isAuthenticated;
        scope.signout = auth.signout;
      }
    };
  })
;
