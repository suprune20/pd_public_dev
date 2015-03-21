'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.shop.main.details', {
        url: '/:shopId',
        templateUrl: 'scripts/modules/hram/shop/templates/details.html',
        resolve: {
          shopData: ['$stateParams', 'shopProvider', function ($stateParams, shopProvider) {
            return shopProvider.getShopDetails($stateParams.shopId);
          }]
        },
        controller: ['$scope', 'shopData', '$modal', function ($scope, shopData, $modal) {
          $scope.shop = shopData;
          $scope.selectedServices = [];

          $scope.placeOrder = function () {
            $modal.open({
              templateUrl: 'views/modules/shop/place_order.modal.html',
              controller: function () {}
            });
          };
        }],
        menuConfig: 'shopMenu'
      });
  })
;
