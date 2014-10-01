'use strict';

angular.module('pdLoru')
  .controller('OptMarketplacePriceCtrl', function ($scope, supplierStore, supplierDetails, cart, categories, $modal,
                                                   growl, selectedCategoriesFilter, $location, auth, suppliers,
                                                   pdLoruSupplier) {
    $scope.loggedUserOrganisation = auth.getUserOrganisation();
    $scope.supplierStore = supplierStore;
    $scope.supplier = supplierDetails;
    $scope.suppliersCollection = suppliers;
    $scope.categories = categories;
    $scope.cart = cart;
    $scope.formData = {
      showAll: true,
      quantities: {},
      comment: {}
    };
    $scope.checkout = function () {
      $modal.open({
        templateUrl: 'views/modules/loru/opt_marketplace/checkout_cart.modal.html',
        controller: function ($scope, $modalInstance) {
          $scope.cart = cart;
          $scope.loggedUserOrganisation = auth.getUserOrganisation();
          $scope.checkout = function () {
            cart.checkout().then(function () { $modalInstance.close(); });
          };
        }
      }).result.then(function () {
          // clear selected quantities of products
          $scope.formData.quantities = {};
          growl.addSuccessMessage('Ваш заказ был успешно добавлен');
        });
    };

    // Store filters
    $scope.filters = {
      // Restore categories filter from query params
      category: _.map(categories, function (category) {
        return _.contains(selectedCategoriesFilter, category.id.toString()) ? category.id.toString() : null;
      })
    };
    // Change query params in browser address line
    $scope.$watch(function () {
      return $scope.filters.category;
    }, function (categories) {
      if (!categories.length) {
        return;
      }

      $location.search({category: _.filter(categories)});
    }, true);

    $scope.applyFilter = function () {
      var filters = _.cloneDeep($scope.filters);
      // clean categories filter
      filters.category = _.filter(filters.category);
      supplierStore.loadStoreData(filters);
    };

    // Search products callback
    $scope.searchData = {
      productNameQuery: ''
    };
    $scope.search = function (product) {
      var searchQuery = $scope.searchData.productNameQuery.toLowerCase();

      return _.contains(product.name.toLowerCase(), searchQuery) ||
        _.contains(product.description.toLowerCase(), searchQuery) ||
        _.contains(product.sku.toLowerCase(), searchQuery);
    };

    // Favorites management
    $scope.addToFavorite = function (supplierId) {
      pdLoruSupplier.addSupplierToFavorite(supplierId)
        .then(function () {
          $scope.supplier.isFavorite = true;
          $scope.updateLoruFavoritesMenu();
        });
    };
    $scope.removeFromFavorites = function (supplierId) {
      pdLoruSupplier.removeSupplierFromFavorites(supplierId)
        .then(function () {
          $scope.supplier.isFavorite = false;
          $scope.updateLoruFavoritesMenu();
        });
    };
  })
;
