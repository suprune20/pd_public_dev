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
  .config(function ($routeProvider, $httpProvider, RavenProvider, ravenDevelopment, oauthIOProvider, $stateProvider) {
    oauthIOProvider.setPublicKey('RveHxs1jud-NEZz9KtCX38GK9AM');
    oauthIOProvider.setOAuthdURL('https://oauth.pohoronnoedelo.ru:6284');

    RavenProvider.development(ravenDevelopment);
    $httpProvider.interceptors.push('authApiInterceptor');
    $httpProvider.interceptors.push('httpErrorsInterceptor');
    // Set interceptor into first position in interceptors
    $httpProvider.interceptors.unshift(function () {
      return {
        request: function (config) {
          // Add common loading tracker
          config.tracker = _.union(
            ['commonLoadingTracker'],
            _.isString(config.tracker) ? [config.tracker] : config.tracker
          );

          return config;
        }
      };
    });
    $stateProvider
      .state('main', {
        url: '/',
        controller: 'LandingPageCtrl',
        templateUrl: 'views/landing_page.html',
        hideMainMenu: true,
        pageClass: 'landing-page'
      })
      .state('403', {
        url: '/403',
        templateUrl: 'views/403.html',
        menuConfig: 'emptyMenu',
        title: 403
      });
    $routeProvider
      .when('/org/signup', {
        controller: 'CommonOrgSignupCtrl',
        templateUrl: 'views/modules/common/org_auth/signup.html',
        title: 'Регистрация поставщика',
        secured: false,
        menuConfig: 'emptyMenu',
        pageClass: 'org-signup-page'
      })
      .when('/signout', {
        resolve: {
          signout: ['auth', '$location', function (auth, $location) {
            auth.signout().then(function () { $location.path('/'); });
          }]
        }
      })
      .when('/useragreement', {
        templateUrl: 'views/terms_and_conditions.text.html',
        title: 'Пользовательское соглашение'
      })
      .otherwise({
        templateUrl: 'views/404.html',
        menuConfig: 'emptyMenu',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth, $state) {
    // Add empty menu config
    mainMenuManager.addMenuConfig('emptyMenu');

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

    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (toState.allowRole && !auth.isContainsRole(toState.allowRole)) {
        event.preventDefault();
        $state.go('403');
        return;
      }
      // Check for secured url and available for current logged in user
      if (!security.isAvailableUrl(toState.url)) {
        event.preventDefault();
        // Save path for redirect after login (internal paths)
        $rootScope.redirectUrl = toState.url;
        $state.go('main');
        return;
      }
      if ('/' === toState.url && auth.isAuthenticated()) {
        event.preventDefault();
        $rootScope.redirectToBasePage();
      }
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      $rootScope.title = toState.title;
      // Set page class from route config
      $rootScope.pageClass = toState.pageClass ?
        _.isString(toState.pageClass) ? [toState.pageClass] : toState.pageClass :
        [];
      // Remove "container" class from root block
      $rootScope.hideRootContainerClass = toState.hideRootContainerClass;
      // Set main menu items
      mainMenuManager.setCurrentMenuConfig(toState.menuConfig);
      // Hide/Show main menu by route param
      mainMenuManager.hide(toState.hideMainMenu);
      if (true === toState.hideMainMenu) {
        $rootScope.addPageClass('hide-main-menu');
      }


      // Save url for redirect after success login (external links) (get param redirect_url)
      $rootScope.redirectUrl = $rootScope.redirectUrl ?
        $rootScope.redirectUrl :
        toParams.redirectUrl || null;


    });

//    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
//      if (currentRoute.absoluteRedirectTo) {
//        // ToDo: Finish redirection to absolute url
//        // $window.location.href = currentRoute.absoluteRedirectTo;
//        return;
//      }
//    });
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
      if (rejection && true === rejection.accessDenied) {
        // Show access denied predefined page
        $location.path('/403');
      }
    });

    $rootScope.redirectToBasePage = function () {
      if (auth.isCurrentHasOmsRole()) {
        $window.location.href = pdConfig.backendUrl;
        return;
      }

      if (auth.isCurrentHasLoruRole()) {
        $state.go('loru.orgplaces');
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
      isCurrentHasClientRole: auth.isCurrentHasClientRole,
      isCurrentHasLoruRole: auth.isCurrentHasLoruRole,
      isCurrentHasOmsRole: auth.isCurrentHasOmsRole,
      isAuthenticated: auth.isAuthenticated
    };

    // Set oauth providers key/title object for templates
    $rootScope.oauthProviders = pdConfig.oauthProviders;
  })
;
