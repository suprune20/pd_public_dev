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
      },
      getShopReviews: function (shopId) {
        return $http.get(pdConfig.apiEndpoint + 'shops/' + shopId + '/reviews')
          .then(function (response) {
            return response.data;
          });
      },
      getShopGallery: function (shopId) {
        return $http.get(pdConfig.apiEndpoint + 'shops/' + shopId + '/gallery')
          .then(function (response) {
            return response.data;
          });
      }
    };
  })

  .service('shopProvider', function (shopApi, pdFrontendCatalogApi, $q) {
    return {
      getShopsCollection: function (queryString, categories) {
        return shopApi.getShops(queryString, categories);
      },
      getShopCategories: function () {
        return pdFrontendCatalogApi.getCategories();
      },
      getShopDetails: function (shopId) {
        return $q.all([
          shopApi.getShop(shopId),
          this.getShopProducts(shopId),
          this.getShopReviews(shopId),
          this.getShopGallery(shopId)
        ]).then(function (responses) {
          var detailsModel = responses[0];

          detailsModel.services = responses[1];
          detailsModel.reviews = responses[2];
          detailsModel.gallery = responses[3];

          return detailsModel;
        });
      },
      getShopProducts: function (shopId) {
        return pdFrontendCatalogApi.getProducts({
          'filter[supplier][]': shopId,
          'filter[isAvailableForVisitOrder]': true
        });
      },
      getShopReviews: function (shopId) {
        return shopApi.getShopReviews(shopId);
      },
      getShopGallery: function (shopId) {
        return shopApi.getShopGallery(shopId);
      }
    };
  })
;
