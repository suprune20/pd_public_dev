'use strict';

angular.module('pdHram')
  .service('shopApi', function ($http, pdConfig) {
    return {
      getShops: function (searchQuery, categories) {
        return $http.get(pdConfig.apiEndpoint + 'shops', {
          params: {
            query: searchQuery || undefined,
            categories: categories
          }
        }).then(function (response) {
          return response.data;
        });
      },
      getShop: function (shopId) {
        return $http.get(pdConfig.apiEndpoint + 'shops/' + shopId)
          .then(function (response) {
            return response.data;
          });
      }
    };
  })

  .service('shopProvider', function (shopApi, pdFrontendCatalogApi) {
    return {
      getShopsCollection: function (queryString, categories) {
        return shopApi.getShops(queryString, categories);
      },
      getShopCategories: function () {
        return pdFrontendCatalogApi.getCategories();
      },
      getShopDetails: function (shopId) {
        return shopApi.getShop(shopId);
      }
    };
  })
;
