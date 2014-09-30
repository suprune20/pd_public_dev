'use strict';

angular.module('pdLoru')
  .service('pdLoruSupplier', function (pdLoruSupplierApi, growl) {
    return {
      addSupplierToFavorite: function (supplierId) {
        return pdLoruSupplierApi.addFavoriteSupplier(supplierId)
          .then(function () {
            growl.addSuccessMessage('Поставщик добавлен в избранные');
          });
      },
      removeSupplierFromFavorites: function (supplierId) {
        return pdLoruSupplierApi.removeFavoriteSupplier(supplierId)
          .then(function () {
            growl.addSuccessMessage('Поставщик удален из избранных');
          });
      }
    };
  })
;
