'use strict';

angular.module('pdCommon')
  .service('pdYandex', function (mapApiLoad, $q) {
    return {
      geocode: function (address) {
        var deferred = $q.defer();

        mapApiLoad(function () {
          ymaps.geocode(address, { results: 1 }).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0),
              result = firstGeoObject.geometry.getCoordinates();
            deferred.resolve(result);
          }, function (err) {
            deferred.reject(err);
          });
        });

        return deferred.promise;
      }
    };
  })
;
