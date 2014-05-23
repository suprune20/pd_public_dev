'use strict';

angular.module('pdApp', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'pdCommon',
    'pdFrontend',
    'pdAdmin',
    'pdLoru',
    'pdOms',
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
      .when('/useragreement', {
        templateUrl: 'views/terms_and_conditions.text.html',
        title: 'Пользовательское соглашение'
      })
      .when('/403', {
        templateUrl: 'views/403.html',
        title: 403
      })
      .otherwise({
        templateUrl: 'views/404.html',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth) {
    $rootScope.pageClass = [];
    $rootScope.addPageClass = function (classValue) {
      if (!classValue) {
        return;
      }

      if (_.isArray(classValue)) {
        $rootScope.pageClass = $rootScope.pageClass.concat(classValue);
      } else {
        $rootScope.pageClass.push(classValue);
      }
    };
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

//    $rootScope.$on('$locationChangeStart', function (event, nextUrl) {
//      // Redirect to oms site
//      if (auth.isAuthenticated() && auth.isCurrentHasOmsRole() && !/\/signout$/.test(nextUrl)) {
//        $window.location.href = pdConfig.backendUrl;
//        event.preventDefault();
//      }
//    });

    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
      if (currentRoute.absoluteRedirectTo) {
        // ToDo: Finish redirection to absolute url
        // $window.location.href = currentRoute.absoluteRedirectTo;
        return;
      }
      // Remove "container" class from root block
      $rootScope.hideRootContainerClass = currentRoute.hideRootContainerClass;
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
      // Set page class from route config
      $rootScope.pageClass = currentRoute.pageClass ?
        _.isString(currentRoute.pageClass) ?
          [currentRoute.pageClass] :
          currentRoute.pageClass :
        [];
      // Hide/Show main menu by route param
      mainMenuManager.hide(currentRoute.hideMainMenu);
      if (true === currentRoute.hideMainMenu) {
        $rootScope.addPageClass('hide-main-menu');
      }

      if ('/' === currentRoute.originalPath && auth.isAuthenticated()) {
        $rootScope.redirectToBasePage();
      }
    });
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
      if (rejection && true === rejection.accessDenied) {
        // Show access denied predefined page
        $location.path('/403');
      }
    });

    $rootScope.redirectToBasePage = function () {
      if (auth.isCurrentHasOmsRole()) {
        $location.path('/oms');
        return;
      }

      if (auth.isCurrentHasLoruRole()) {
        $location.path('/loru');
        return;
      }

      $location.path('/client-panel');
    };

    // Custom email regexp
    $rootScope.EMAIL_REGEXP = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
    // Save backend url into root scope for using in templates
    $rootScope.backendUrl = pdConfig.backendUrl;
    // Security mirror object for use in templates
    $rootScope.security = {
      isCurrentHasClientRole: auth.isCurrentHasClientRole
    };
  })
;
