'use strict';

angular.module('pdOms')
  .service('omsBurialsApi', function ($http, pdConfig, $q) {
    return {
      postBurial: function (burialData) {
        return $http
          .post(pdConfig.apiEndpoint + 'oms/burials', burialData || {}, { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          }, function (response) {
            return $q.reject(response.data);
          });
      },
      putBurial: function (burialId, burialData) {
        return $http
          .put(pdConfig.apiEndpoint + 'oms/burials/' + burialId, burialData || {}, { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          }, function (response) {
            return $q.reject(response.data);
          });
      }
    };
  })

  .service('omsBurials', function (omsBurialsApi) {
    return {
      createBurial: function (burialData) {
        return omsBurialsApi.postBurial(burialData);
      },
      saveBurial: function (burialId, updateData) {
        return omsBurialsApi.putBurial(burialId, updateData);
      }
    };
  })
;
