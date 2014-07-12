'use strict';

angular.module('pdFrontend')
  .service('pdFrontendCatalogApi', function ($http, pdConfig) {
    return {
      getFilters: function () {
        return $http.get(pdConfig.apiEndpoint + 'catalog_filters')
          .then(function (resp) {
            return resp.data;
          });
      },
      getCategories: function () {
        return $http.get(pdConfig.apiEndpoint + 'catalog/categories')
          .then(function (resp) {
            return resp.data.results;
          });
      },
      getSuppliers: function (_categories) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/suppliers', {
          params: {
            categories: _categories
          }
        }).then(function (resp) {
          return resp.data.supplier;
        });
      },
      getProducts: function (paramsData) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/products', {
          params: paramsData
        }).then(function (resp) {
          return resp.data.results;
        });
      },
      getProduct: function (productId) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/products/' + productId)
          .then(function (resp) {
            return resp.data.results[0];
          });
      },
      getPlaces: function (statuses) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/places', {
          params: {
            'filter[status]': _.isArray(statuses) ? statuses : [statuses]
          }
        }).then(function (response) {
          return response.data;
        });
      }
    };
  })
;
