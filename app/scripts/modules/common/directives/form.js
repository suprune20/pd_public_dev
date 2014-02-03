'use strict';

angular.module('pdCommon')
  .directive('fixAutofill', function () {
    return function (scope, iElement, iAttrs) {
      iAttrs.$observe('fixAutofill', function (needFix) {
        needFix = scope.$eval(needFix);
        if (true === needFix) {
          iElement.find('input, textarea, select').trigger('change');
        }
      });
    };
  })
;