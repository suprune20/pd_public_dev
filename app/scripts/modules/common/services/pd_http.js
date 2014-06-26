'use strict';

angular.module('pdCommon')
  .service('pdSimpleHttp', function ($http, $q) {
    var transformHttpPromise = function (httpPromise) {
      var deferred = $q.defer();
      httpPromise
        .then(function (successResponse) {
          return deferred.resolve(successResponse.data);
        }, function (errorResponse) {
          return deferred.reject(errorResponse.data);
        });

      return deferred.promise;
    };

    return {
      get: function (url, config) {
        return transformHttpPromise($http.get(url, config));
      },
      post: function (url, data, config) {
        return transformHttpPromise($http.post(url, data, config));
      },
      put: function (url, data, config) {
        return transformHttpPromise($http.put(url, data, config));
      },
      'delete': function (url, config) {
        return transformHttpPromise($http.delete(url, config));
      }
    };
  })
;
