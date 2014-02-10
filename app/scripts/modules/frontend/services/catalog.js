'use strict';

angular.module('pdFrontend')
  .factory('Catalog', function ($http, pdConfig) {
    return function (productsCountPerRequest) {
      // Products data provider class
      var ProductsDataProvider = function (productsCountPerRequest) {
        var isBusy = false,
          isNoProducts = false,
          products = [],
          filtersData = {};

        productsCountPerRequest = productsCountPerRequest || 15;

        function getNextProducts() {
          if (isBusy || isNoProducts) {
            return;
          }

          isBusy = true;
          $http.get(pdConfig.apiEndpoint + 'products', {
              params: _.merge(filtersData || {}, {
                limit: productsCountPerRequest,
                offset: products.length
              }),
              tracker: 'commonLoadingTracker'
            }).then(function (resp) {
              isBusy = false;
              isNoProducts = resp.data.results.length < productsCountPerRequest;
              products = products.concat(resp.data.results);
            }, function () { isBusy = false; });
        }

        return {
          getNextProducts: getNextProducts,
          isBusy: function () { return isBusy; },
          isNoMoreProducts: function () { return isNoProducts && products.length >= productsCountPerRequest; },
          getProducts: function () {
            return products;
          },
          // Clear previous filters/products and apply new filters data
          applyFilters: function (_filtersData_) {
            isNoProducts = false;
            filtersData = {};
            _.forEach(_filtersData_, function (value, key) {
              filtersData['filter[' + key + ']'] = value;
            });
            products = [];
            getNextProducts();
          }
        };
      };
      // Create instance of products data provider class
      var productsDataProvider = new ProductsDataProvider(productsCountPerRequest);

      function getFilters() {
        return $http.get(pdConfig.apiEndpoint + 'catalog_filters', {tracker: 'commonLoadingTracker'})
          .then(function (resp) {
            return resp.data;
          });
      }

      function getCategories() {
        return $http.get(pdConfig.apiEndpoint + 'product_category', {tracker: 'commonLoadingTracker'})
          .then(function (resp) {
            return resp.data.results;
          });
      }

      function getProduct(productId) {
        return $http.get(pdConfig.apiEndpoint + 'product', {
          params: {
            id: productId
          },
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data.results[0];
        });
      }

      return {
        getFilters: getFilters,
        getCategories: getCategories,
        productsDataProvider: productsDataProvider,
        getProduct: getProduct
      };
    };
  })
;
