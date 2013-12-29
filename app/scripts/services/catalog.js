'use strict';

angular.module('pdApp')
  .factory('Catalog', function ($timeout) {
    return function (productsCountPerRequest) {
      // Products data provider class
      var ProductsDataProvider = function (productsCountPerRequest) {
        var isBusy = false,
          isNoProducts = false,
          products = [];

        productsCountPerRequest = productsCountPerRequest || 15;

        function getProducts() {
          return products;
        }

        function getNextProducts() {
          if (isBusy || isNoProducts) {
            return;
          }

          isBusy = true;
          $timeout(function () {
            for (var i = 0; i < productsCountPerRequest; i++) {
              products.push({
                id: i,
                photo: Math.floor(Math.random() * 10) % 2 ? 'http://placehold.it/100x100' : null,
                title: 'Product ' + i,
                sku: 'sku ' + i,
                description: 'Description of product ' + i,
                supplier: 'Supplier ' + i,
                price: i
              });
            }
            isBusy = false;
          }, 2000);
        }

        return {
          isBusy: function () { return isBusy; },
          isNoMoreProducts: function () { return isNoProducts; },
          getProducts: getProducts,
          getNextProducts: getNextProducts
        };
      };
      // Create instance of products data provider class
      var productsDataProvider = new ProductsDataProvider(productsCountPerRequest);

      function getFilters() {
        return {
          places: [
            {id: 1, title: 'Место 1'},
            {id: 2, title: 'Место 2'},
            {id: 3, title: 'Место 3'}
          ],
          suppliers: [
            {id: 1, title: 'Поставщик 1'},
            {id: 2, title: 'Поставщик 2'},
            {id: 3, title: 'Поставщик 3'}
          ]
        };
      }

      function getCategories() {
        return [
          {id: 1, title: 'Категория 1'},
          {id: 2, title: 'Категория 2'},
          {id: 3, title: 'Категория 3'}
        ];
      }

      function getProduct(productId) {
        return {
          id: productId,
          photo: Math.floor(Math.random() * 10) % 2 ? 'http://placehold.it/100x100' : null,
          title: 'Product ' + productId,
          sku: 'sku ' + productId,
          description: 'Description of product ' + productId,
          supplier: 'Supplier ' + productId,
          price: productId * 100
        };
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
