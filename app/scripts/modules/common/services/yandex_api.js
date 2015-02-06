'use strict';

angular.module('pdCommon')
  .service('pdYandex', function (mapApiLoad, $q) {
    return {
      currentPosition: function () {
        var deferred = $q.defer();

        mapApiLoad(function () {
          deferred.resolve(ymaps.geolocation);
        });

        return deferred.promise;
      },
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
      },
      reverseGeocode: function (coords) {
        var deferred = $q.defer();

        mapApiLoad(function () {
          ymaps.geocode(coords, { results: 1 }).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);

            deferred.resolve({
              name: firstGeoObject.properties.get('name'),
              text: firstGeoObject.properties.get('text')
            });
          }, function (err) {
            deferred.reject(err);
          });
        });

        return deferred.promise;
      },
      getBoundsByPoints: function (points) {
        if (points.length < 2) {
          return null;
        }

        var bounds = {
          northeast: _.cloneDeep(points[0]),
          southwest: _.cloneDeep(points[0])
        };

        _.forEach(points, function (point) {
          bounds.northeast.latitude = point.latitude > bounds.northeast.latitude ?
            point.latitude :
            bounds.northeast.latitude;
          bounds.northeast.longitude = point.longitude > bounds.northeast.longitude ?
            point.longitude :
            bounds.northeast.longitude;
          bounds.southwest.latitude = point.latitude < bounds.southwest.latitude ?
            point.latitude :
            bounds.southwest.latitude;
          bounds.southwest.longitude = point.longitude < bounds.southwest.longitude ?
            point.longitude :
            bounds.southwest.longitude;
        });

        return [
          [bounds.southwest.longitude, bounds.southwest.latitude],
          [bounds.northeast.longitude, bounds.northeast.latitude]
        ];
      }
    };
  })
;
