'use strict';

angular.module('pdApp')
  .controller('LandingPageCtrl', function ($scope, auth, $location, $modal) {
    var resetMessages = function () {
      $scope.formErrorMessage = null;
      $scope.formSuccessMessage = null;
    };
    // Reset signin form values and error message when move between login forms
    $scope.$watch('loadedLoginForm', function () {
      resetMessages();
      $scope.signinModel = {};
    });
    $scope.signin = function (signinModel, form) {
      resetMessages();
      auth.signin(signinModel.username, signinModel.password, signinModel.acceptTC)
        .then(function () {
          $location.path($scope.getBaseUrlByCurrentRole());
        }, function (errorData) {
          if ('not_accepted_tc' === errorData.errorCode) {
            // Show Terms&Conditions modal window
            $modal.open({
                templateUrl: 'views/terms_and_conditions.modal.html'
              })
              .result.then(function () {
                signinModel.acceptTC = true;
                // Resend signin data with acceptTC flag
                $scope.signin(signinModel, form);
              });

            return;
          }

          $scope.formErrorMessage = 'Неверный {type} или пароль'
            .replace('{type}', 'clientLoginForm' === form.$name ? 'номер телефона' : 'логин');
        });
    };
    $scope.getPasswordBySms = function (username, captchaData) {
      resetMessages();
      auth.getPasswordBySMS(username, captchaData)
        .then(function (responseData) {
          if ('success' === responseData.status) {
            $scope.formSuccessMessage = 'Пароль установлен: ' + responseData.password;
          }
        }, function (errorData) {
          if (_.has(errorData, 'status') && 'error' === errorData.status) {
            $scope.formErrorMessage = errorData.message;
            return;
          }

          $scope.formErrorMessage = 'Неизвестная ошибка. Обратитесь к администрации сайта';
        });
    };
  })
;
