'use strict';

angular.module('pdFrontend')
  .service('pdFrontendOrders', function (pdFrontendOrderApi) {
    return {
      getAvailablePerformersForPhoto: function (placeId, location) {
        return pdFrontendOrderApi.getAvailablePerformers('photo', placeId, location);
      }
    };
  })
;
