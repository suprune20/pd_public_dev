'use strict';

angular.module('pdApp', [
    'ngRoute',
    'ngAnimate',
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
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth) {
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
        $rootScope.redirectToBasePage();
      }
    });

    $rootScope.redirectToBasePage = function () {
      if (auth.isCurrentHasLoruRole() || auth.isCurrentHasOmsRole()) {
        $window.location.href = pdConfig.backendUrl;
        return;
      }

      $location.path('/client-panel');
    };
  })
;
