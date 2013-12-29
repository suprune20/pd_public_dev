'use strict';

angular.module('pdApp', [
    'ngRoute',
    'ui.bootstrap.modal',
    'ui.bootstrap.templates',
    'ui.select2',
    'infinite-scroll'
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
      .otherwise('/')
    ;
  })
  .run(function ($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (currentRoute) {
      $rootScope.title = currentRoute.title;
    });
  })
;
