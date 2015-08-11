'use strict';

angular.module('pdCommon')
  .directive('defaultImage', function () {
    return {
      restrict: 'A',
      link: function (scope, iElement, iAttrs) {
        iAttrs.$observe('ngSrc', function (ngSrc) {
          if (!ngSrc) {
            iElement.attr('src', iAttrs.defaultImage);
          }
        });
      }
    };
  })

  .directive('pdElevateZoom', function () {
    return {
      restrict: 'A',
      scope: {
        options: '&pdElevateZoom'
      },
      link: function (scope, iElement) {
        setTimeout(function () {
          iElement.ezPlus(scope.options() || {});
        }, 1000);
      }
    };
  })
;
