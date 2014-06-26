'use strict';

angular.module('pdFrontend')
  .controller('pdFrontendAuth', function ($scope, auth, $modal, $modalInstance, growl, oauthIO, modalNotifications) {
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
      },
      getOauthSignupModel = function (oauthResult, providerId) {
        return oauthResult.me().then(function (profileData) {
          return {
            oauth: {
              provider: providerId,
              accessToken: oauthResult.accessToken
            },
            profile: {
              firstname: profileData.firstName,
              lastname: profileData.lastName,
              email: profileData.email
            }
          };
        });
      };

    $scope.signinOAuth = function (providerId) {
      auth.signinOAuth(providerId)
        .then(successSigninCb, function (errorData) {
          if ('oauth_provider_not_attached' === errorData.errorCode) {
            modalNotifications.confirm('Пользователь, связанный с этим акаунтом, не найден. Создать аккаунт автоматически?')
              .then(function () {
                // Auto-registration user
                getOauthSignupModel(errorData.oauthResult, providerId).
                  then(function (signupModel) {
                    auth.signup(signupModel)
                      .then(function () {
                        $modalInstance.close();
                        growl.addSuccessMessage('Вы успешно зарегистрировались в системе');
                      }, function (errorData) {
                        $scope.formErrorMessage = errorData.message;
                      });
                  });
              });
            return;
          }

          growl.addErrorMessage(errorData.message);
        });
    };
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
    $scope.getSignupOAuthData = function (providerId) {
      oauthIO.popup(providerId)
        .then(function (oauthResult) {
          getOauthSignupModel(oauthResult, providerId).
            then(function (signupModel) { $scope.signupModel = signupModel; });
        });
    };
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
  })
;