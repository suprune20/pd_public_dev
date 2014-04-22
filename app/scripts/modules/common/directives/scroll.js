'use strict';

angular.module('pdCommon')
  .directive('isolateScrolling', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.on('mouseover', function () {
          document.body.style.overflow = 'hidden';
        });
        element.on('mouseleave', function () {
          document.body.style.overflow = 'auto';
        });
      }
    };
  })
;
