'use strict';

angular.module('pdCommon')
  .controller('pdCommonFeedbackModalCtrl', function ($scope, $modalInstance, auth, feedback, growl) {
    $scope.isAuthenticated = auth.isAuthenticated;
    $scope.feedbackData = {
      email: auth.getUserProfile().email,
      recaptchaData: null
    };
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.sendFeedback = function () {
      $scope.formError = null;
      feedback.save($scope.feedbackData)
        .then(function () {
          growl.addSuccessMessage('Ваш запрос был успешно отправлен');
          $scope.close();
        }, function () {
          $scope.formError = 'Произошла ошибка! Запрос не был послан. Попробуйте повторить вопрос позже.';
        });
    };
  })
;