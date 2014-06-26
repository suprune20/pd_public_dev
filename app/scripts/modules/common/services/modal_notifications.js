'use strict';

angular.module('pdCommon')
  .service('modalNotifications', function ($modal, $rootScope) {
    return {
      confirm: function (bodyText, headerText, okBtnCaption, cancelBtnCaption) {
        var scope = $rootScope.$new();
        scope.bodyText = bodyText;
        scope.headerText = headerText;
        scope.okBtnCaption = okBtnCaption;
        scope.cancelBtnCaption = cancelBtnCaption;

        return $modal.open({
          templateUrl: 'views/modules/common/confirm.modal.html',
          scope: scope
        }).result;
      }
    };
  })
;
