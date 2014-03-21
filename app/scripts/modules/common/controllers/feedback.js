'use strict';

angular.module('pdCommon')
  .controller('pdCommonFeedbackModalCtrl', function ($scope, $modalInstance, auth, feedback, growl) {
    $scope.isAuthenticated = auth.isAuthenticated;
    $scope.feedbackData = {
      email: auth.getUserProfile().email,
      recaptchaData: null,
      firstName: auth.getUserProfile().firstname,
      lastName: auth.getUserProfile().lastname,
      middleName: auth.getUserProfile().middlename,
      phoneNumber: auth.getUserProfile().mainPhone
    };
    $scope.sendFeedback = function () {
      $scope.formError = null;
      feedback.save($scope.feedbackData)
        .then(function () {
          growl.addSuccessMessage('Ваш запрос был успешно отправлен');
          $modalInstance.dismiss();
        }, function (errorRespData) {
          $scope.formError = errorRespData.message ||
            'Произошла ошибка! Запрос не был послан. Попробуйте повторить вопрос позже.';
        });
    };
  })
;