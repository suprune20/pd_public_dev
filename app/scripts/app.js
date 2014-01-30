'use strict';

angular.module('pdApp', [
    'ngRoute',
    'pdCommon',
    'pdFrontend',
    'pdAdmin',
    'pdConfig',
    'vcRecaptcha',
    'ivpusic.cookie'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('authApiInterceptor');
    $routeProvider
      .when('/', {
        controller: 'LandingPageCtrl',
        templateUrl: 'views/landing_page.html',
        hideMainMenu: true
      })
      .when('/loru', {
        template: 'Лору',
        title: 'Лору панель',
        secured: true,
        menuConfig: 'adminMenu'
      })
      .otherwise({
        templateUrl: 'views/404.html',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, security, pdConfig, mainMenuManager, auth) {
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
      // Check for secured url and available for current logged in user
      if (!security.isAvailableUrl(currentRoute.originalPath)) {
        $location.path('/');
        return;
      }
      // Set title for current page from routeProvider data
      $rootScope.title = currentRoute.title;
      // Set main menu items
      mainMenuManager.setCurrentMenuConfig(currentRoute.menuConfig);
      // Hide/Show main menu by route param
      mainMenuManager.hide(currentRoute.hideMainMenu);

      if ('/' === currentRoute.originalPath && auth.isAuthenticated()) {
        $location.path($rootScope.getBaseUrlByCurrentRole());
      }
    });

    $rootScope.getBaseUrlByCurrentRole = function () {
      if (auth.isCurrentHasLoruRole() || auth.isCurrentHasOmsRole()) {
        return '/loru';
      }

      return '/client-panel';
    };
  })
;
