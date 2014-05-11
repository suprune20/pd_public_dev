'use strict';

angular.module('pdLoru')
  // ToDo: move methods into service
  .controller('LoruAdvertisementCtrl', function ($scope, $q, advertisement, objectsDiff, modalNotifications, $location) {
    // Check is exist my stores for show alert message
    advertisement.isExistsMyStores().catch(function () {
      modalNotifications.confirm('У Вас не добавлено ниодного склада. Хотите добавить сейчас?', 'Отсутствуют склады')
        .then(function () {
          $location.path('/loru/orgplaces');
        });
    });

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
      getProductsData = function () {
        $q.all([advertisement.getProductsByPlaces(), advertisement.getCurrentBalance()])
          .then(function (responseData) {
            var productsData = responseData[0];

            $scope.balanceData = responseData[1];
            $scope.balanceData.amount = parseFloat($scope.balanceData.amount);
            // Calculate products/places data
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
      // Calculate total upped products cost
      $scope.totalUpped = _.reduce($scope.changedProducts, function (total, itemData) {
        if ('up' !== itemData.status) {
          return total;
        }

        return total + parseFloat(_.find($scope.places, {id: parseInt(itemData.placeId, 10)}).costForUp);
      }, 0);
      // Calculate total enabled products cost
      $scope.totalEnabled = _.reduce(convertProductsStates(newProductsStates), function (total, itemData) {
        if (!_.contains(['enable', 'up'], itemData.status)) {
          return total;
        }

        return total + parseFloat(_.find($scope.places, {id: parseInt(itemData.placeId, 10)}).costForEnable);
      }, 0);
      // Calculate available balance days
      if ($scope.balanceData && $scope.totalEnabled) {
        $scope.balanceData.availablePeriod = ($scope.balanceData.amount - $scope.totalUpped) > 0 ?
          Math.round(($scope.balanceData.amount - $scope.totalUpped) / $scope.totalEnabled) :
          0;
      }
    }, true);

    // Save changes in products/places data
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
