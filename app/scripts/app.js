'use strict';

angular.module('pdApp', [
    'ngRoute',
    'pdCommon',
//    'ui.select2',
//    'infinite-scroll',
//    'yaMap',
//    'angularLocalStorage',
//    'corrupt.loadingSpinnerWidget',
    'oc.lazyLoad'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('authApiInterceptor');
    $routeProvider
      .when('/', {
        controller: 'MainCtrl',
        templateUrl: 'views/landing.html'
      })
//      .when('/test', {
//        template: '<div oc-lazy-load="\'pdFrontend\'"></div>'
//      })
      .when('/ololo', {
        templateUrl: 'views/1234.html'
      })
      .when('/catalog', {
        controller: 'CatalogCtrl',
        templateUrl: 'views/catalog/main.html',
        reloadOnSearch: false,
        title: 'Каталог',
        secured: true
      })
      .when('/client-panel', {
        controller: 'ClientPanelCtrl',
        templateUrl: 'views/client/panel.html',
        title: 'Панель клиента',
        secured: true
      })
//      .when('/test', {
//        resolve: {
//          test: function($ocLazyLoad) {
//            return $ocLazyLoad.load({
//              name: 'pdFrontendApp',
//              files: [
//                'scripts/modules/frontend/app.js',
//                'scripts/modules/frontend/controllers/catalog.js',
//                'scripts/modules/frontend/controllers/client_panel.js'
//              ]
//            });
//          }
//        }
//      })
      .when('/403', {
        template: '403'
      })
      .otherwise({
        templateUrl: 'views/404.html',
        title: 404
      })
    ;
  })
  .config(function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      modules: [
        {
          name: 'pdFrontend',
          files: [
            'scripts/modules/frontend/module.js',
            'scripts/modules/frontend/controllers/catalog.js',
            'scripts/modules/frontend/controllers/client_panel.js',
            'scripts/modules/frontend/services/catalog.js',
            'scripts/modules/frontend/services/user.js'
          ]
        }
      ],
      asyncLoader: $script
    });
  })
  .run(function ($rootScope, $location, security, pdConfig, $route) {
    $rootScope.$on('$routeChangeStart', function (event, nextRoute) {
      if ('/test' === nextRoute.originalPath) {
        $location.path('/403');
      }
    });
//    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
//      // Check for secured url and available for current logged in user
//      if (!security.isAvailableUrl(currentRoute.originalPath)) {
//        $location.path('/signin');
//        return;
//      }
//      // Set title for current page from routeProvider data
//      $rootScope.title = currentRoute.title;
//      // Set main menu items
//      $rootScope.mainMenuItems = pdConfig.mainMenu;
//    });
  })
;
