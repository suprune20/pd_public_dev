'use strict';

angular.module('pdFrontend')
  .controller('PdFrontendSettingsCtrl', function ($scope, user, objectsDiff) {
    var getInitialData = function () {
      return _.defaults(user.getCurrentUserProfile(), {
        mainPhone: null,
        oldPassword: '',
        newPassword: ''
      });
    };

    $scope.settingsData = getInitialData();
    $scope.save = function () {
      $scope.errorData = null;
      user.saveSettings(objectsDiff(getInitialData(), $scope.settingsData))
        .then(function () {
          // Update form data after success update
          $scope.settingsData = getInitialData();
        }, function (errorData) {
          $scope.errorData = errorData;
        });
    };
  })
;