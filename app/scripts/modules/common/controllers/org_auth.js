'use strict';

angular.module('pdCommon')
  .controller('CommonOrgSignupCtrl', function ($scope, OrgAuthSignupModel, $location, growl, $state, vcRecaptchaService) {
    $scope.authProvider = new OrgAuthSignupModel($state.current.data.orgType);
    $scope.signup = function () {
      $scope.authProvider.signup()
        .then(function (responseData) {
          growl.addSuccessMessage(responseData.message, {ttl: 20000});
          $location.path('/');
        }, function (errorData) {
          vcRecaptchaService.reload();
          $scope.errorMsg = errorData.message;
        });
    };
  })
;
