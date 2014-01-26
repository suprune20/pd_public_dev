'use strict';

angular.module('pdApp', [
    'ngRoute',
    'pdCommon',
    'pdFrontend',
    'pdConfig'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('authApiInterceptor');
    $routeProvider
      .when('/', {
        redirectTo: '/client-panel'
      })
      .when('/signin', {
        controller: 'AuthSigninCtrl',
        templateUrl: 'views/auth/signin.html',
        title: 'Вход'
      })
      .otherwise({
        templateUrl: 'views/404.html',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, security, pdConfig) {
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
      // Check for secured url and available for current logged in user
      if (!security.isAvailableUrl(currentRoute.originalPath)) {
        $location.path('/signin');
        return;
      }
      // Set title for current page from routeProvider data
      $rootScope.title = currentRoute.title;
      // Set main menu items
      $rootScope.mainMenuItems = pdConfig.mainMenu;
    });
  })
;
