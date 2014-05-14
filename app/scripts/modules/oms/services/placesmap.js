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
              iconImageHref: _.intersection(place.status, ['dt_unowned', 'dt_unindentified']).length ?
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
      filterPlacesGeoObjects: function (placesGeoObjects, statusesFilter) {
        var selectedStatuses = [];
        _.forEach(statusesFilter, function (isActive, status) {
          if (isActive) {
            selectedStatuses.push(status);
          }
        });

        return _.map(placesGeoObjects, function (placeGeoObject) {
          placeGeoObject.options.visible = selectedStatuses.length ?
            // show point with any intersected statuses with selected statuses filter
            !!_.intersection(placeGeoObject.properties.placeData.status, selectedStatuses).length :
            // if no selected statuses show points without statuses
            !placeGeoObject.properties.placeData.status.length;

          return placeGeoObject;
        });
      }
    };
  })
;
