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
      },
      calculateTotal = function (status) {
        return _.reduce($scope.changedProducts, function (total, itemData) {
          if (status !== itemData.status) {
            return total;
          }

          var placeData = _.find($scope.places, {id: parseInt(itemData.placeId, 10)});

          return total + parseFloat(placeData.cost);
        }, 0);
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
      $scope.totalEnabled = calculateTotal('enable');
      $scope.totalUpped = calculateTotal('up');
    }, true);
    $scope.saveChanges = function () {
      advertisement.saveProductsChanges($scope.changedProducts).then(function () {
        $scope.changedProducts = [];
      });
    };
    $scope.cancelChanges = function () {
      $scope.newProductsStates = _.cloneDeep(initialProductsStates);
      $scope.changedProducts = [];
    };
    $scope.resetAllStates = function () {
      _.forEach($scope.newProductsStates, function (productData, productId) {
        _.forEach(productData, function (status, placeId) {
          $scope.newProductsStates[productId][placeId] = 'disable';
        });
      });
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
