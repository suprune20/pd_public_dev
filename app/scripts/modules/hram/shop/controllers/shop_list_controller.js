'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.shop.main.list', {
        url: '',
        templateUrl: 'scripts/modules/hram/shop/templates/list.html',
        resolve: {
          shopCategories: ['shopProvider', function (shopProvider) {
            return shopProvider.getShopCategories();
          }]
        },
        controller: function ($scope, shopCategories, shopProvider) {
          $scope.filterCategories = shopCategories;
          $scope.searchFilters = {};

          $scope.fetchShopsCollection = function () {
            shopProvider.getShopsCollection($scope.searchFilters.query, $scope.searchFilters.categories)
              .then(function (fetchedShopsCollection) {
                $scope.shopsCollection = fetchedShopsCollection;
              });
          };

          // Initial fetch shops data
          $scope.fetchShopsCollection();
        },
        menuConfig: 'shopMenu'
      });
  })
;
