'use strict';

angular.module('pdFrontend')
  .controller('PdFrontendSettingsCtrl', function ($scope, user, objectsDiff, $modal, additionalSettingsData, growl,
                                                  $location) {
    var getInitialData = function () {
      var userProfile = user.getCurrentUserProfile();

      return _.defaults(userProfile, {userPhoto: userProfile.photo}, {
        mainPhone: null,
        oldPassword: '',
        newPassword: ''
      });
    };

    $scope.settingsData = getInitialData();
    $scope.save = function () {
      $scope.errorData = null;
      user.saveSettings(objectsDiff(getInitialData(), $scope.settingsData), $scope.settingsData.userPhoto)
        .then(function () {
          var userPhoto = $scope.settingsData.userPhoto;
          // Update form data after success update
          $scope.settingsData = getInitialData();
          $scope.settingsData.userPhoto = userPhoto;
        }, function (errorData) {
          $scope.errorData = errorData;
        });
    };
    $scope.removeAccount = function () {
      $modal.open({templateUrl: 'views/modules/frontend/settings/confirm_delete.modal.html'})
        .result.then(function () {
          user.removeAccount().then(function () {
            growl.addSuccessMessage('Аккаунт был успешно удален');
            $location.path('/');
          });
        });
    };

    $scope.additionalSettingsData = additionalSettingsData;
    $scope.attachOAuthProvider = function (providerId) {
      additionalSettingsData.attachOAuthProvider(providerId)
        .then(function () {
          growl.addSuccessMessage('Аккаунт был успешно подключен');
        }, function (errorData) {
          growl.addErrorMessage('Произошла ошибка при подключении акаунта: ' + errorData.message);
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
