'use strict';

angular.module('pdApp', [
    'ngRoute',
    'ui.bootstrap.modal',
    'ui.bootstrap.carousel',
    'ui.bootstrap.templates',
    'ui.select2',
    'infinite-scroll',
    'yaMap',
    'angularLocalStorage',
    'corrupt.loadingSpinnerWidget'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('authApiInterceptor');
    $routeProvider
      .when('/', {
        controller: 'MainCtrl',
        templateUrl: 'views/main.html',
        title: 'Главная'
      })
      .when('/signin', {
        controller: 'AuthSigninCtrl',
        templateUrl: 'views/auth/signin.html',
        title: 'Вход'
      })
      .when('/contacts', {
        templateUrl: 'views/contacts.html',
        title: 'Контакты'
      })
      .when('/about-us', {
        templateUrl: 'views/about_us.html',
        title: 'О нас'
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
      .otherwise('/')
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
