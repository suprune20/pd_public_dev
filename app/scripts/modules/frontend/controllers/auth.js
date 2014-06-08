'use strict';

angular.module('pdFrontend')
  .controller('pdFrontendAuth', function ($scope, auth, $modal, $modalInstance) {
    var showTCModal = function () {
      $modal.open({templateUrl: 'views/terms_and_conditions.modal.html'})
        .result.then(function () {
          $scope.signin(_.merge($scope.signinModel, {confirmTC: true}));
        }, function () {
          $scope.signinModel = {};
        });
    };
    $scope.signinOAuth = function (providerId) {
      auth.signinOAuth(providerId);
    };
    $scope.signin = function (signinModel) {
      auth.signin(signinModel.username, signinModel.password, signinModel.confirmTC)
        .then(function () {
          console.log('asdasd');
          $modalInstance.close();
        }, function (errorData) {
          if ('wrong_credentials' === errorData.errorCode) {
            $scope.formErrorMessage = 'Неверный логин/номер телефона или пароль';

            return;
          }

          // T&C hasn't been confirmed - show popup
          if ('unconfirmed_tc' === errorData.errorCode) {
            showTCModal();
            return;
          }

          $scope.formErrorMessage = 'Произошла неизвестная ошибка. Попробуйте еще раз или обратитесь к администрации сайта';
        });
    };
  })
;