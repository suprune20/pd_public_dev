'use strict';

angular.module('pdCommon')
  .service('pdHttp', function ($http, $q) {
    var getConfig = function (config) {
        return _.merge({
          tracker: 'commonLoadingTracker'
        }, config || {});
      },
      transformHttpPromise = function (httpPromise) {
        var deferred = $q.defer();
        httpPromise
          .then(function (successResponse) {
            return deferred.resolve(successResponse.data);
          }, function (errorResponse) {
            return deferred.reject(errorResponse.data, errorResponse.status);
          });

        return deferred.promise;
      };

    return {
      get: function (url, config) {
        return transformHttpPromise($http.get(url, getConfig(config)));
      },
      post: function (url, data, config) {
        return transformHttpPromise($http.post(url, data, getConfig(config)));
      },
      put: function (url, data, config) {
        return transformHttpPromise($http.put(url, data, getConfig(config)));
      },
      'delete': function (url, config) {
        return transformHttpPromise($http.delete(url, getConfig(config)));
      }
    };
  })
;
