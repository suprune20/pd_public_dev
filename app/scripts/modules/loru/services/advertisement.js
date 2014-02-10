'use strict';

angular.module('pdLoru')
  .service('advertisement', function ($http, pdConfig, $q) {
    var getProducts = function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/products', {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data;
        });
      },
      getPlaces = function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/places', {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data.results;
        });
      },
      saveProductsChanges = function (productsData) {
        var preparedProductsData = _(productsData)
          .groupBy(function (obj) {
            return obj.productId;
          })
          .map(function (productData, productId) {
            return {
              id: parseInt(productId, 10),
              places: _.map(productData, function (product) {
                return {
                  id: parseInt(product.placeId, 10),
                  status: product.status
                };
              })
            };
          })
          .value()
        ;

        return $http.post(pdConfig.apiEndpoint + 'loru/product_places', preparedProductsData, {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data;
        });
      },
      getProductsByPlaces = function () {
        return $q.all([this.getProducts(), this.getPlaces()])
          .then(function (resultData) {
            var productsByPlaces = {},
              products = resultData[0],
              places = resultData[1];

            _.forEach(products, function (product) {
              productsByPlaces[product.id] = {};
              _.forEach(places, function (place) {
                productsByPlaces[product.id][place.id] = _.contains(product.availableOnPlaces, place.id) ?
                  'enable' :
                  'disable';
              });
            });

            return {
              productsByPlaces: productsByPlaces,
              products: products,
              places: places
            };
          });
      }
    ;

    return {
      getProducts: getProducts,
      getPlaces: getPlaces,
      saveProductsChanges: saveProductsChanges,
      getProductsByPlaces: getProductsByPlaces
    };
  })
;
