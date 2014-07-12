'use strict';

angular.module('pdFrontend')
  .factory('CatalogUnownedPlaces', function (pdFrontendCatalogApi) {
    return function () {
      var placesGeoObjects = [],
        selectedPlacesGallery = [];

      // Get unowned places data and convert into geo objects when create instance
      pdFrontendCatalogApi.getPlaces(['dt_unowned', 'dt_unindentified'])
        .then(function (placesData) {
          placesGeoObjects = _.map(placesData, function (place) {
            return {
              properties: {
                type: 'unidentified_place',
                pointData: place
              },
              options: {
                iconImageHref: 'images/redCircleDotIcon.png',
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
        });

      return {
        getPlacesGeoObjects: function () {
          return placesGeoObjects;
        },
        selectorPolygonGeoObject: {
          geometry: {
            type: 'Polygon',
            coordinates: []
          },
          options: {
            editorDrawingCursor: 'crosshair'
          }
        },
        getSelectedPlacesGallery: function () {
          return selectedPlacesGallery;
        },
        filterPlacesBySelectorYaHandler: function (event) {
          // Reset current gallery before filter
          selectedPlacesGallery = [];

          var polygonGeoObject = event.get('target');
          if (!polygonGeoObject.geometry.getBounds()) {
            return;
          }

          ymaps.geoQuery(polygonGeoObject.getMap().geoObjects).searchIntersect(polygonGeoObject)
            .search('properties.type = "unidentified_place"')
            .each(function (geoObject) {
              var placeModel = geoObject.properties.get('pointData');
              placeModel.photos.forEach(function (photoModel) {
                photoModel.cemetery = {
                  address: placeModel.cemetery.address,
                  phones: placeModel.cemetery.phones
                };
                photoModel.placeAddress = placeModel.address;
                selectedPlacesGallery.push(photoModel);
              });
            });
        }
      };
    };
  })
;
