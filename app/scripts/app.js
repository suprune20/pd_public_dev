'use strict';

angular.module('pdApp', [
    'ngRoute',
    'ngAnimate',
    'pdCommon',
    'pdFrontend',
    'pdAdmin',
    'pdLoru',
    'pdConfig',
    'vcRecaptcha',
    'ivpusic.cookie',
    'ngRaven'
  ])
  .config(function ($routeProvider, $httpProvider, RavenProvider, ravenDevelopment) {
    RavenProvider.development(ravenDevelopment);
    $httpProvider.interceptors.push('authApiInterceptor');
    $routeProvider
      .when('/', {
        controller: 'LandingPageCtrl',
        templateUrl: 'views/landing_page.html',
        hideMainMenu: true,
        pageClass: 'landing-page'
      })
      .otherwise({
        templateUrl: 'views/404.html',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth) {
    $rootScope.$on('auth.signout', function () {
      $location.path('/');
    });
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
      $rootScope.pageClass = currentRoute.pageClass;

      if ('/' === currentRoute.originalPath && auth.isAuthenticated() && !auth.isCurrentHasOmsRole()) {
        $rootScope.redirectToBasePage();
      }
    });

    $rootScope.redirectToBasePage = function () {
      if (auth.isCurrentHasOmsRole()) {
        $window.location.href = pdConfig.backendUrl;
        return;
      }

      if (auth.isCurrentHasLoruRole()) {
        $location.path('/loru');
        return;
      }

      $location.path('/client-panel');
    };
  })
;
