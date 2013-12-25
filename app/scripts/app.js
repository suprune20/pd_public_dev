'use strict';

angular.module('pdApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        title: 'Главная страница'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function ($rootScope, $route) {
    $rootScope.$on('$routeChangeSuccess', function () {
      $rootScope.title = $route.current.title;
    });
  })
;
