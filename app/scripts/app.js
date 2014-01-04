'use strict';

angular.module('pdApp', [
    'ngRoute',
    'ui.bootstrap.modal',
    'ui.bootstrap.carousel',
    'ui.bootstrap.templates',
    'ui.select2',
    'infinite-scroll',
    'yaMap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'MainCtrl',
        templateUrl: 'views/main.html',
        title: 'Главная'
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
        title: 'Каталог'
      })
      .when('/client-panel', {
        controller: 'ClientPanelCtrl',
        templateUrl: 'views/client/panel.html',
        title: 'Панель клиента'
      })
      .otherwise('/')
    ;
  })
  .run(function ($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
      $rootScope.title = currentRoute.title;
    });
  })
;
