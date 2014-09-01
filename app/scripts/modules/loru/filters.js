'use strict';

angular.module('pdLoru')
  .filter('orderStatusLabel', function (optMarketplace) {
    return function (value) {
      return optMarketplace.getStatusLabel(value);
    };
  })
;