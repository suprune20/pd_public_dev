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
    'seo',
    'ngMask'
  ])
  .config(function ($routeProvider, $httpProvider, RavenProvider, ravenDevelopment, oauthIOProvider, $locationProvider,
                    $stateProvider, $urlRouterProvider) {
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    oauthIOProvider.setPublicKey('U5vhE-IS4G7DhIj79rJDEhakx5E');
    oauthIOProvider.setOAuthdURL('https://oauth.nasledievnukov.ru:6284');

    RavenProvider.development(ravenDevelopment);

    // Setup http provider configs
    $httpProvider.defaults.withCredentials = true;
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

    $urlRouterProvider.otherwise('/404');
    $stateProvider
      .state('main', {
        url: '/?redirectUrl',
        controller: function ($scope, $modal) {
          if ($scope.security.isAuthenticated()) {
            $scope.redirectToBasePage();

            return;
          }

          $modal.open({
            templateUrl: 'views/modules/frontend/client_auth.modal.html',
            controller: 'pdFrontendAuth',
            backdrop: 'static',
            windowClass: 'frontend-auth-modal'
          });
        }
      })

      .state('register', {
        url: '/register',
        controller: 'CommonOrgSignupCtrl',
        templateUrl: 'views/modules/common/org_auth/signup.html',
        data: {
          orgType: 'loru'
        },
        title: 'Регистрация поставщика',
        secured: false,
        menuConfig: 'emptyMenu',
        pageClass: 'org-signup-page'
      })
      .state('registerOms', {
        url: '/register_oms',
        controller: 'CommonOrgSignupCtrl',
        templateUrl: 'views/modules/common/org_auth/signup.html',
        data: {
          orgType: 'oms'
        },
        title: 'Регистрация поставщика',
        secured: false,
        menuConfig: 'emptyMenu',
        pageClass: 'org-signup-page'
      })
      .state('signout', {
        url: '/signout',
        resolve: {
          signout: ['auth', '$location', function (auth, $location) {
            auth.signout().then(function () { $location.path('/'); });
          }]
        }
      })
      .state('useragreement', {
        url: '/useragreement',
        templateUrl: 'views/terms_and_conditions.text.html',
        title: 'Пользовательское соглашение'
      })
      .state('403', {
        url: '/403',
        templateUrl: 'views/403.html',
        menuConfig: 'emptyMenu',
        title: 403
      })
      .state('404', {
        url: '/404',
        templateUrl: 'views/404.html',
        menuConfig: 'emptyMenu',
        title: 404
      })
    ;
  })
  .run(function ($rootScope, $location, $window, security, pdConfig, mainMenuManager, auth, seoProvider, $state,
                 $modalStack) {
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
    // setup seo provider
    $rootScope.seo = seoProvider;

    $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
      if (toState.absoluteRedirectTo) {
        event.preventDefault();
        // ToDo: Finish redirection to absolute url
        $window.location.href = toState.absoluteRedirectTo;
        return;
      }

      // Remove "container" class from root block
      $rootScope.hideRootContainerClass = toState.hideRootContainerClass;
      // Save url for redirect after success login (external links) (get param redirect_url)
      $rootScope.redirectUrl = $rootScope.redirectUrl ?
        $rootScope.redirectUrl :
        toStateParams.redirectUrl || null;

      // Set seo data for current page from routeProvider data
      var toStateSeoData = toState.seo || {};
      $rootScope.seo.setTitle(toState.title);
      $rootScope.seo.setDescription(toStateSeoData.description);
      $rootScope.seo.setKeywords(toStateSeoData.keywords);

      // Set main menu items
      mainMenuManager.setCurrentMenuConfig(
        toState.menuConfig ? toState.menuConfig : mainMenuManager.getMenuByRole(auth.getRoles()[0])
      );
      // Set page class from route config
      $rootScope.pageClass = toState.pageClass ?
        _.isString(toState.pageClass) ?
          [toState.pageClass] :
          toState.pageClass :
        [];
      $rootScope.setFluidContainer = !!toState.setFluidContainer;
      // Hide/Show main menu by route param
      mainMenuManager.hide(toState.hideMainMenu);
      if (true === toState.hideMainMenu) {
        $rootScope.addPageClass('hide-main-menu');
      }

      // Reset prerender status code to 200 (SEO)
      $rootScope.seo.setStatusCode(200);
    });

    $rootScope.$on('$stateChangeSuccess', function () {
      // Hit analytics tracking events after change state
      if ($window.ga) {
        $window.ga('send', 'pageview', $location.path());
      }
      if ($window.yaCounter25697954) {
        $window.yaCounter25697954.hit($location.path());
      }

      // Close all previous opened modals
      $modalStack.dismissAll();
    });

    // handle error access
    $rootScope.$on('$stateChangeError', function(event, toState, toStateParams, fromState, fromStateParams, rejection) {
      if (rejection.accessDenied) {
        event.preventDefault();

        if (auth.isAuthenticated()) {
          // Show access denied predefined page
          $state.go('403');
        } else {
          $rootScope.redirectUrl = window.location.pathname;
          $state.go('catalog');
        }
      }
    });

    $rootScope.$on('auth.signin_success', function () {
      if ($rootScope.redirectUrl) {
        var redirectUrl = $rootScope.redirectUrl;
        $rootScope.redirectUrl = null;
        $location.search('redirectUrl', null);

        if (/^https?:\/\//.test(redirectUrl)) {
          $window.location.href = redirectUrl;
          return;
        }

        $location.path(redirectUrl);
        return;
      }

      // Update main menu config after signin
      mainMenuManager.setCurrentMenuConfig(mainMenuManager.getMenuByRole(auth.getRoles()[0]));
      // Redirect after login for LORU/OMS
      if (auth.isCurrentHasLoruRole() || auth.isCurrentHasOmsRole()) {
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

    // Custom email regexp
    $rootScope.EMAIL_REGEXP = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
    // Save backend url into root scope for using in templates
    $rootScope.backendUrl = pdConfig.backendUrl;
    // Security mirror object for use in templates
    $rootScope.security = {
      isCurrentHasClientRole: auth.isCurrentHasClientRole,
      isCurrentHasLoruRole: auth.isCurrentHasLoruRole,
      isCurrentHasOmsRole: auth.isCurrentHasOmsRole,
      isCurrentHasSupervisorRole: auth.isCurrentHasSupervisorRole,
      isAuthenticated: auth.isAuthenticated,
      isOrgAbility: auth.isOrgAbility
    };
    // Save top-level domain
    $rootScope.topLevelDomain = _.last($window.location.hostname.split('.')).toLowerCase();

    // Set oauth providers key/title object for templates
    $rootScope.oauthProviders = pdConfig.oauthProviders;

    // set numeral language format config
    $window.numeral.language('ru');

    // share $state object for templates and child scopes
    $rootScope.$state = $state;
  })
;
