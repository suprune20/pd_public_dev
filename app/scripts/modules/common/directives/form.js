'use strict';

angular.module('pdCommon')
  .directive('fixAutofill', function ($interval) {
    return function (scope, iElement, iAttrs) {
      var intervalPromise;

      iAttrs.$observe('fixAutofill', function (needFix) {
        if (true === scope.$eval(needFix)) {
          intervalPromise = $interval(function () {
            iElement.find('input').trigger('change');
          }, 500);
        } else if (intervalPromise) {
          // Clear intervals between needFix callbacks callbacks
          $interval.cancel(intervalPromise);
        }
      });
      scope.$on('$destroy', function () {
        $interval.cancel(intervalPromise);
      });
    };
  })
;