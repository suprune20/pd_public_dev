'use strict';

angular.module('pdApp')
  .controller('LandingPageCtrl', function ($scope, auth, $location, ipCookie) {
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
      auth.signin(signinModel.username, signinModel.password)
        .then(function (a) {
          console.log('auth success', a);
          ipCookie('pdsession', a.sessionId, {domain: '.pohoronnoedelo.ru'});
          $location.path($scope.getBaseUrlByCurrentRole());
        }, function (errorData) {
          if ('not_accepted_tc' === errorData.errorCode) {
            console.log('show T&C modal');
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
