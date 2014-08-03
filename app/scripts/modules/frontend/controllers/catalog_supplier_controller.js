'use strict';

angular.module('pdFrontend')
  .controller('CatalogSupplierCtrl', function ($scope, $modal, $state) {
    $modal.open({
      templateUrl: 'views/modules/frontend/catalog/supplier.details.modal.html',
      windowClass: 'catalog-supplier-modal',
      resolve: {
        supplierData: function () {
          return $scope.catalog.getSupplier($state.params.supplierId);
        }
      },
      controller: function ($scope, supplierData) {
        // set product name into page title
        $scope.seo
          .setTitle(supplierData.name)
          .setDescription(supplierData.name + '. ' + supplierData.description || '');
        $scope.supplierData = supplierData;
        $scope.supplierData.storesGeoObjects = _.map(supplierData.stores, function (storeModel) {
          return {
            properties: {
              pointData: storeModel
            },
            geometry: {
              type: 'Point',
              coordinates: [storeModel.location.longitude, storeModel.location.latitude]
            }
          };
        });
      }
    }).result.catch(function () {
      // Redirect to catalog state only if modal has been closed manually
      if ('catalog.supplier' === $state.current.name) {
        $state.go('catalog');
      }
    });
  })
;
