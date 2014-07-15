'use strict';

angular.module('pdFrontend')
  .controller('pdFrontendAuth', function ($scope, auth, $modal, $modalInstance, growl, OrgAuthSignupModel) {
    var showTCModal = function () {
        $modal.open({templateUrl: 'views/terms_and_conditions.modal.html'})
          .result.then(function () {
            $scope.signin(_.merge($scope.signinModel, {confirmTC: true}));
          }, function () {
            $scope.signinModel = {};
          });
      },
      successSigninCb = function () {
        $modalInstance.close();
        growl.addSuccessMessage('Вы успешно авторизировались');
      }
    ;

    // Set initial models
    $scope.signinModel = {};
    $scope.signin = function (signinModel) {
      auth.signin(signinModel.username, signinModel.password, signinModel.confirmTC)
        .then(successSigninCb, function (errorData) {
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

    // Signup functionality
    $scope.signupModel = {};
    $scope.signup = function () {
      $scope.signupErrorMsg = '';
      auth.signup($scope.signupModel)
        .then(function () {
          $modalInstance.close();
          growl.addSuccessMessage('Вы успешно зарегистрировались в системе');
        }, function (errorData) {
          $scope.signupErrorMsg = errorData.message;
        });
    };
    $scope.authProvider = new OrgAuthSignupModel();
    $scope.signup = function () {
      $scope.authProvider.signup()
        .then(function (responseData) {
          growl.addSuccessMessage(responseData.message, {ttl: 20000});
          $modalInstance.close();
        }, function (errorData) {
          $scope.errorMsg = errorData.message;
        });
    };
    // Restore password modal
    $scope.openRestorePasswordPopup = function () {
      $modal.open({
        templateUrl: 'views/restore_password.modal.html',
        resolve: {
          signinScope: function () { return $scope; }
        },
        controller: ['$scope', '$modalInstance', 'signinScope', 'vcRecaptchaService', function (
          $scope,
          $modalInstance,
          signinScope,
          vcRecaptchaService
        ) {
          $scope.restoreModel = {
            username: signinScope.signinModel.username || ''
          };
          $scope.getPasswordBySms = function (username, captchaData) {
            auth.getPasswordBySMS(username, captchaData)
              .then(function (responseData) {
                if ('success' === responseData.status && _.has(responseData, 'message')) {
                  signinScope.formSuccessMessage = responseData.message;
                  $modalInstance.close();
                }
              }, function (errorData) {
                vcRecaptchaService.reload();
                $scope.restoreErrorMessage = errorData.message;
              });
          };
        }]
      });
    };
  })
;