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
    'ngRaven',
    'seo'
  ])
  .config(function ($routeProvider, $httpProvider, RavenProvider, ravenDevelopment, oauthIOProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');

    oauthIOProvider.setPublicKey('RveHxs1jud-NEZz9KtCX38GK9AM');
    oauthIOProvider.setOAuthdURL('https://oauth.pohoronnoedelo.ru:6284');

    RavenProvider.development(ravenDevelopment);
    $httpProvider.interceptors.push('authApiInterceptor');
    $httpProvider.interceptors.push('httpErrorsInterceptor');
    $httpProvider.interceptors.push('seoSnapshotReadyInterceptor');
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
    $routeProvider
      .when('/', {
        controller: 'CatalogCtrl',
        templateUrl: 'views/modules/frontend/catalog/main.html',
        reloadOnSearch: false,
        title: 'Каталог',
        pageClass: 'catalog-page',
        setFluidContainer: true
      })
      .when('/register', {
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
      .when('/403', {
        templateUrl: 'views/403.html',
        menuConfig: 'emptyMenu',
        title: 403
      })
      .otherwise({
        templateUrl: 'views/404.html',
        menuConfig: 'emptyMenu',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth) {
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
      mainMenuManager.setCurrentMenuConfig(
        currentRoute.menuConfig ? currentRoute.menuConfig : mainMenuManager.getMenuByRole(auth.getRoles()[0])
      );
      // Set page class from route config
      $rootScope.pageClass = currentRoute.pageClass ?
        _.isString(currentRoute.pageClass) ?
          [currentRoute.pageClass] :
          currentRoute.pageClass :
        [];
      $rootScope.setFluidContainer = !!currentRoute.setFluidContainer;
      // Hide/Show main menu by route param
      mainMenuManager.hide(currentRoute.hideMainMenu);
      if (true === currentRoute.hideMainMenu) {
        $rootScope.addPageClass('hide-main-menu');
      }

//      if ('/' === currentRoute.originalPath && auth.isAuthenticated()) {
//        $rootScope.redirectToBasePage();
//      }
    });
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
      if (rejection && true === rejection.accessDenied) {
        // Show access denied predefined page
        $location.path('/403');
      }
    });

    $rootScope.$on('auth.signin_success', function () {
      // Update main menu config after signin
      mainMenuManager.setCurrentMenuConfig(mainMenuManager.getMenuByRole(auth.getRoles()[0]));
      // Redirect after login for LORU/OMS
      if (auth.isCurrentHasLoruRole() || auth.isCurrentHasOmsRole()) {
        $rootScope.redirectToBasePage();
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
      isCurrentHasClientRole: auth.isCurrentHasClientRole,
      isCurrentHasLoruRole: auth.isCurrentHasLoruRole,
      isCurrentHasOmsRole: auth.isCurrentHasOmsRole,
      isAuthenticated: auth.isAuthenticated
    };
    // Save top-level domain
    $rootScope.topLevelDomain = _.last($window.location.hostname.split('.')).toLowerCase();

    // Set oauth providers key/title object for templates
    $rootScope.oauthProviders = pdConfig.oauthProviders;
  })
;
