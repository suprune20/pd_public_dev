'use strict';

angular.module('pdLoru')
  .controller('LoruAdvertisementCtrl', function ($scope, advertisement, objectsDiff) {
    var initialProductsStates = {},
      getChangedProducts = function () {
        var ret = [];
        _.forEach(objectsDiff(initialProductsStates, $scope.newProductsStates), function (productData, productId) {
          _.forEach(productData, function (status, placeId) {
            ret.push({
              productId: productId,
              placeId: placeId,
              status: status
            });
          });
        });

        return ret;
      };

    advertisement.getProductsByPlaces()
      .then(function (productsData) {
        initialProductsStates = productsData.productsByPlaces;
        $scope.products = productsData.products;
        $scope.places = productsData.places;
        $scope.newProductsStates = _.cloneDeep(initialProductsStates);
      });

    $scope.productAvailable = function (product, placeId) {
      return _.contains(product.availableOnPlaces, placeId);
    };
    $scope.$watch('newProductsStates', function () {
      $scope.changedProducts = getChangedProducts();
      $scope.total = _.reduce($scope.changedProducts, function (total, itemData) {
        if ('disable' === itemData.status) {
          return total;
        }

        var placeData = _.find($scope.places, {id: parseInt(itemData.placeId, 10)});

        return total + parseFloat(placeData.cost);
      }, 0);
    }, true);
    $scope.saveChanges = function () {
      advertisement.saveProductsChanges($scope.changedProducts);
    };
    $scope.isChangedProductInPlace = function (productId, placeId, status) {
      var needData = {
        productId: String(productId),
        placeId: String(placeId)
      };

      if (status) {
        needData.status = status;
      }

      return _.some($scope.changedProducts, needData);
    };
  })
;
