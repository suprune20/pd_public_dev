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
          return resp.data;
        });
      },
      getSupplier: function (supplierSlug) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/suppliers/' + supplierSlug)
          .then(function (response) {
            return response.data;
          });
      },
      getProducts: function (paramsData) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/products', {
          params: paramsData
        }).then(function (response) {
          return _.map(response.data, function (productModel) {
            productModel.sku = productModel.sku ? productModel.sku : productModel.id;
            productModel.sku = 'pd' + productModel.sku;

            return productModel;
          });
        });
      },
      getProduct: function (productId) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/products/' + productId)
          .then(function (response) {
            var productModel = response.data;
            productModel.sku = productModel.sku ? productModel.sku : productModel.id;
            productModel.sku = 'pd' + productModel.sku;

            return productModel;
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
