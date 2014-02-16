'use strict';

angular.module('pdLoru')
  .controller('LoruAdvertisementCtrl', function ($scope, advertisement, objectsDiff) {
    var initialProductsStates = {},
      convertProductsStates = function (productsStates) {
        var ret = [];
        _.forEach(productsStates, function (productData, productId) {
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
      getChangedProducts = function () {
        return convertProductsStates(objectsDiff(initialProductsStates, $scope.newProductsStates));
      },
      calculateTotal = function (status, productsData) {
        return _.reduce(productsData ? productsData : $scope.changedProducts, function (total, itemData) {
          if (status !== itemData.status) {
            return total;
          }

          var placeData = _.find($scope.places, {id: parseInt(itemData.placeId, 10)});

          return total + parseFloat(placeData.cost);
        }, 0);
      },
      getProductsData = function () {
        advertisement.getProductsByPlaces()
          .then(function (productsData) {
            initialProductsStates = productsData.productsByPlaces;
            $scope.products = productsData.products;
            $scope.places = productsData.places;
            $scope.newProductsStates = _.cloneDeep(initialProductsStates);
          });
      };

    getProductsData();
    $scope.productAvailable = function (product, placeId) {
      return _.contains(product.availableOnPlaces, placeId);
    };
    $scope.$watch('newProductsStates', function (newProductsStates) {
      $scope.changedProducts = getChangedProducts();
      $scope.totalUpped = calculateTotal('up');
      $scope.totalEnabled = calculateTotal('enable', convertProductsStates(newProductsStates)) + $scope.totalUpped;
    }, true);
    $scope.saveChanges = function () {
      advertisement.saveProductsChanges($scope.changedProducts).then(function () {
        $scope.changedProducts = [];
        getProductsData();
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
