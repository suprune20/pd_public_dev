'use strict';

angular.module('pdFrontend')
  .controller('PdFrontendSettingsCtrl', function ($scope, user, objectsDiff, $modal, additionalSettingsData, growl) {
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
    $scope.removeAccount = function () {
      $modal.open({templateUrl: 'views/modules/frontend/settings/confirm_delete.modal.html'})
        .result.then(function () { user.removeAccount(); });
    };

    $scope.additionalSettingsData = additionalSettingsData;
    $scope.attachOAuthProvider = function (providerId) {
      additionalSettingsData.attachOAuthProvider(providerId)
        .then(function () {
          growl.addSuccessMessage('Аккаунт был успешно подключен');
        }, function () {
          growl.addErrorMessage('Произошла ошибка при подключении акаунта');
        });
    };
    $scope.detachOAuthProvider = function (providerId) {
      additionalSettingsData.detachOAuthProvider(providerId)
        .then(function () {
          growl.addSuccessMessage('Аккаунт ' + providerId + ' был успешно отключен');
        }, function () {
          growl.addErrorMessage('Произошла ошибка при отключении акаунта ' + providerId);
        });
    };
  })
;