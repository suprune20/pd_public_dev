'use strict';

angular.module('pdCommon')
  .controller('CommonOrgSignupCtrl', function ($scope, OrgAuthSignupModel, $location, growl, $routeParams) {
    $scope.authProvider = new OrgAuthSignupModel($routeParams.orgType);
    $scope.signup = function () {
      $scope.authProvider.signup()
        .then(function (responseData) {
          growl.addSuccessMessage(responseData.message, {ttl: 20000});
          $location.path('/');
        }, function (errorData) {
          $scope.errorMsg = errorData.message;
        });
    };
  })
;
