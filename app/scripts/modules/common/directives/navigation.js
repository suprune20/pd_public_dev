'use strict';

angular.module('pdCommon')
  .directive('pdMainMenu', function (mainMenuManager, security, auth, $modal) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'views/modules/common/directives/main_menu.html',
      controller: function ($scope) {
        // watch exists redirectUrl param in url for auto open login modal window
        $scope.$watch('redirectUrl', function (redirectUrl) {
          if (redirectUrl) {
            $scope.signinModal();
          }
        });

        $scope.signinModal = function () {
          $modal.open({
            templateUrl: 'views/modules/frontend/client_auth.modal.html',
            controller: 'pdFrontendAuth',
            backdrop: 'static',
            windowClass: 'frontend-auth-modal'
          });
        };
      },
      link: function (scope) {
        scope.menuManager = mainMenuManager;
        scope.$watch(function () {
          return mainMenuManager.getMenuItems();
        }, function (menuItems) {
          scope.menuItems = _.filter(menuItems, function (item) {
            return security.isAvailableUrl(item.link);
          });
        });
        scope.$watch(function () {
          return mainMenuManager.getRightMenuItems();
        }, function (menuItems) {
          scope.rightMenuItems = _.filter(menuItems, function (item) {
            return security.isAvailableUrl(item.link);
          });
        });
        scope.auth = auth;
        scope.showFeedbackModal = function () {
          $modal.open({
            templateUrl: 'views/modules/common/feedback.modal.html',
            controller: 'pdCommonFeedbackModalCtrl'
          });
        };
      }
    };
  })
  .directive('activeLink', function ($location, $timeout) {
    return {
      restrict: 'AC',
      link: function (scope, iElement, iAttrs) {
        scope.$watch(function () {
          return $location.path();
        }, function (path) {
          // Wait compile directives
          $timeout(function () {
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
          }, 100);
        });
      }
    };
  })
;
