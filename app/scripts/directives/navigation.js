'use strict';

angular.module('pdApp')
  .directive('activeLink', function ($location) {
    return {
      restrict: 'AC',
      link: function (scope, iElement, iAttrs) {
        scope.$watch(function () {
          return $location.path();
        }, function (path) {
          var url = iElement.find('a').attr('href'),
            activeClass = iAttrs.activeLink || 'active';

          if (url) {
            url = url.substring(1);
          }

          if (path === url) {
            iElement.addClass(activeClass);
          } else {
            iElement.removeClass(activeClass);
          }
        });
      }
    };
  })
;
