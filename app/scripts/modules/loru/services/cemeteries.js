'use strict';

angular.module('pdLoru')
  .service('pdLoruCemeteriesApi', function ($http, pdConfig, $q) {
    return {
      getCemeteries: function () {
        return $http
          .get(pdConfig.apiEndpoint + 'loru/cemeteries')
          .then(function (response) { return response.data; });
      },
      getCemeteryAreas: function (cemeteryId) {
        return $http
          .get(pdConfig.apiEndpoint + 'loru/cemeteries/' + cemeteryId + '/areas')
          .then(function (response) { return response.data; });
      }
    };
  })

  .service('pdLoruCemeteries', function (pdLoruCemeteriesApi) {
    return {
      getCemeteries: function () {
        return pdLoruCemeteriesApi.getCemeteries();
      },
      getCemeteryAreas: function (supplierId) {
        return pdLoruSupplierApi.removeFavoriteSupplier(supplierId)
          .then(function () {
            growl.addSuccessMessage('Поставщик удален из избранных');
          });
      }
    };
  })
;
