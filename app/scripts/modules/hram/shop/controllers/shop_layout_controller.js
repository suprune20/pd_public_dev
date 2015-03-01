'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.shop.main', {
        url: '',
        templateUrl: 'scripts/modules/hram/shop/templates/layout.html',
        controller: ['$scope', function ($scope) {
          $scope.setPlaceMarker = function (event) {
            $scope.selectedPlaceMarker = {
              geometry: {
                type: 'Point',
                coordinates: event.get('coords')
              },
              properties: {
                type: 'users_place'
              },
              options: {
                preset: 'twirl#redIcon',
                draggable: true
              }
            };
          };
        }],
        abstract: true,
        menuConfig: 'shopMenu'
      });
  })
;
