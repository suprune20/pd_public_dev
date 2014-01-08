'use strict';

angular.module('pdApp')
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
;