'use strict';

angular.module('pdOms')
  .service('omsPlaces', function ($http, pdConfig) {
    return {
      getPlaces: function () {
        return $http.get(pdConfig.apiEndpoint + 'oms/places', {tracker: 'commonLoadingTracker'})
          .then(function (resp) {
            return _.filter(resp.data, function (place) {
              return place.location;
            });
          });
      },
      getYaMapGeoObjectsForPlaces: function (places) {
        return _.map(places, function (place) {
          var placeDetailsPageUrl = pdConfig.backendUrl + 'manage/cemetery/' +
            place.cemeteryId + '/area/' + place.areaId + '/place/' + place.id;

          return {
            properties: {
              placeData: place,
              balloonContentBody: '<a href="' + placeDetailsPageUrl + '" target="_blank">Перейти на карточку места</a>'
            },
            options: {
              iconImageHref: _.intersection(place.status, ['dt_free']).length ?
                'images/redCircleDotIcon.png' :
                'images/blueCircleDotIcon.png',
              iconImageSize: [5, 5],
              iconImageOffset: [-2.5, -2.5],
              iconContentOffset: [-2.5, -2.5],
              iconContentSize: [10, 10]
            },
            geometry: {
              type: 'Point',
              coordinates: [place.location.longitude, place.location.latitude]
            }
          };
        });
      },
      filterPlacesGeoObjects: function (placesGeoObjects, filters) {
        var selectedStatuses = [];
        _.forEach(filters.statusFilter, function (isActive, status) {
          if (isActive) {
            selectedStatuses.push(status);
          }
        });

        return _.map(placesGeoObjects, function (placeGeoObject) {
          var statuses = placeGeoObject.properties.placeData.status;
          placeGeoObject.options.visible = !!(filters.showActive ?
            // active burials: if select any needed statuses for burials
            selectedStatuses.length ?
              // if selected any statuses when filter by them
              _.intersection(statuses, selectedStatuses).length :
              // else show all points with any statuses
              statuses.length :
            // inactive burials: if "show all active burials" is not set when show burials without statuses
            // and burials with any selected statuses
            !statuses.length || _.intersection(statuses, selectedStatuses).length
          );

          return placeGeoObject;
        });
      }
    };
  })
;
