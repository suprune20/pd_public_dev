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
    'ngRaven'
  ])
  .config(function ($routeProvider, $httpProvider, RavenProvider, ravenDevelopment) {
    RavenProvider.development(ravenDevelopment);
    $httpProvider.interceptors.push('authApiInterceptor');
    $httpProvider.interceptors.push('httpErrorsInterceptor');
    $routeProvider
      .when('/', {
        controller: 'LandingPageCtrl',
        templateUrl: 'views/landing_page.html',
        hideMainMenu: true,
        pageClass: 'landing-page'
      })
      .when('/signout', {
        resolve: {
          signout: ['auth', function (auth) {
            auth.signout();
          }]
        }
      })
      .otherwise({
        templateUrl: 'views/404.html',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth) {
    $rootScope.recaptchaPublicKey = pdConfig.recaptchaPubKey;
    $rootScope.$on('auth.signout', function () {
      $location.path('/');
    });
    $rootScope.$on('auth.signin_success', function () {
      // Redirect to requested page if needed
      if ($rootScope.redirectUrl) {
        var redirectUrl = $rootScope.redirectUrl;
        $rootScope.redirectUrl = null;
        $location.search('redirect_url', null);

        if (/^https?:\/\//.test(redirectUrl)) {
          $window.location.href = redirectUrl;
          return;
        }

        $location.path(redirectUrl);
        return;
      }

      $rootScope.redirectToBasePage();
    });

    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
      // Save url for redirect after success login (external links) (get param redirect_url)
      $rootScope.redirectUrl = $rootScope.redirectUrl ?
        $rootScope.redirectUrl :
        currentRoute.params.redirectUrl || null;

      // Check for secured url and available for current logged in user
      if (!security.isAvailableUrl(currentRoute.originalPath)) {
        // Save path for redirect after login (internal paths)
        $rootScope.redirectUrl = currentRoute.originalPath;
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
