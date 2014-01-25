'use strict';

angular.module('pdCommon')
  .directive('pdMenu', function (security) {
    return {
      restrict: 'EA',
      template: '<li active-link ng-repeat="item in getMenuItems()"><a ng-href="#{{item.link}}">{{item.title}}</a></li>',
      link: function (scope, iElement, iAttrs) {
        var menuItems;

        if (!_.has(iAttrs, 'pdMenu')) {
          return;
        }

        scope.$watch(iAttrs.pdMenu, function (menuItemsData) {
          menuItems = menuItemsData;
        });
        scope.getMenuItems = function () {
          return _.filter(menuItems, function (item) {
            return security.isAvailableUrl(item.link);
          });
        };
      }
    };
  })
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
