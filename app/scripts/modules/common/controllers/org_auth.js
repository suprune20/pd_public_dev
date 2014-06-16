'use strict';

angular.module('pdCommon')
  .controller('CommonOrgSignupCtrl', function ($scope, OrgAuthSignupModel, $location, growl) {
    $scope.authProvider = new OrgAuthSignupModel();
    $scope.signup = function () {
      $scope.authProvider.signup()
        .then(function () {
          growl.addSuccessMessage('Регистрация прошла успешно. Начните работу с поиска и добавления мест.');
          $location.path('/map');
        }, function (errorData) {
          $scope.errorMsg = errorData.message;
        });
    };
  })
;
