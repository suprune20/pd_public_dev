'use strict';

angular.module('pdOms')
  .service('omsCemeteriesApi', function ($http, pdConfig, $q) {
    return {
      getCemeteries: function () {
        return $http
          .get(pdConfig.apiEndpoint + 'oms/cemeteries', { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          }, function (response) {
            return $q.reject(response.data);
          });
      },
      getCemeteryAreas: function (cemeteryId) {
        return $http
          .get(pdConfig.apiEndpoint + 'oms/cemeteries/' + cemeteryId + '/areas', { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          }, function (response) {
            return $q.reject(response.data);
          });
      },
      getCemeteryAreaPlaces: function (cemeteryId, areaId) {
        return $http
          .get(pdConfig.apiEndpoint + 'oms/cemeteries/' + cemeteryId + '/areas/' + areaId, { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          }, function (response) {
            return $q.reject(response.data);
          });
      }
    };
  })

  .service('omsCemeteries', function (omsCemeteriesApi) {
    return {
      getCemeteries: function () {
        return omsCemeteriesApi.getCemeteries();
      },
      getCemeteryAreas: function (cemeteryId) {
        return omsCemeteriesApi.getCemeteryAreas(cemeteryId);
      },
      getCemeteryAreaPlaces: function (cemeteryId, areaId) {
        return omsCemeteriesApi.getCemeteryAreas(cemeteryId, areaId);
      }
    };
  })
;
