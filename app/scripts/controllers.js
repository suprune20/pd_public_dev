'use strict';

angular.module('pdApp')
  .controller('LandingPageCtrl', function ($scope, auth, $location, $modal, vcRecaptchaService) {
    var resetMessages = function () {
      $scope.formErrorMessage = null;
      $scope.formSuccessMessage = null;
    };
    // Reset signin form values and error message when move between login forms
    $scope.$watch('loadedLoginForm', function () {
      resetMessages();
      $scope.signinModel = {};
    });
    $scope.showTCModal = function () {
      $modal.open({templateUrl: 'views/terms_and_conditions.modal.html'})
        .result.then(function () {
          $scope.signin(_.merge($scope.signinModel, {confirmTC: true}));
        }, function () {
          $scope.signinModel = {};
        });
    };
    $scope.signin = function (signinModel, form) {
      resetMessages();
      auth.signin(signinModel.username, signinModel.password, signinModel.confirmTC)
        .catch(function (errorData) {
          if ('wrong_credentials' === errorData.errorCode) {
            $scope.formErrorMessage = 'Неверный {type} или пароль'
              .replace('{type}', 'clientLoginForm' === form.$name ? 'номер телефона' : 'логин');

            return;
          }

          // T&C hasn't been confirmed - show popup
          if ('unconfirmed_tc' === errorData.errorCode) {
            $scope.showTCModal();

            return;
          }

          $scope.formErrorMessage = 'Произошла неизвестная ошибка. Попробуйте еще раз или обратитесь к администрации сайта';
        });
    };
    $scope.getPasswordBySms = function (username, captchaData) {
      resetMessages();
      auth.getPasswordBySMS(username, captchaData)
        .then(function (responseData) {
          if ('success' === responseData.status && _.has(responseData, 'message')) {
            $scope.formSuccessMessage = responseData.message;
          }
        }, function (errorData) {
          vcRecaptchaService.reload();
          $scope.formErrorMessage = errorData.message;
        });
    };
  })
;
