'use strict';

angular.module('pdFrontend')
  .service('pdFrontendClientPanel', function ($q, pdFrontendPlacesApi) {
    return {
      getPlacesCollection: function () {
        var that = this;

        return pdFrontendPlacesApi.getPlaces()
          .then(function (placesCollection) {
            var deadmansIds = _.reduce(placesCollection, function (ids, place) {
              return ids.concat(place.deadmans);
            }, []);

            // Get deadmans collection by places deadmans ids
            return pdFrontendPlacesApi.getDeadmans({ids: deadmansIds.join(',')})
              .then(function (deadmansCollection) {
                deadmansCollection = _.indexBy(deadmansCollection, 'id');

                return {
                  // Insert deadmans objects into depends places
                  places: _.map(placesCollection, function (place) {
                    place.deadmans = _.map(place.deadmans, function (deadmanId) {
                      return deadmansCollection[deadmanId];
                    });

                    return place;
                  }),
                  placesYandexPoints: _.map(placesCollection, function (place) {
                    return that.getPlaceYandexPoint(place);
                  })
                };
              });
          });
      },
      getPlaceYandexPoint: function (placeModel) {
        return {
          geometry: {
            type: 'Point',
            coordinates: [placeModel.location.longitude, placeModel.location.latitude]
          },
          properties: {
            placeModel: placeModel
          },
          options: {
            preset: 'twirl#brownIcon'
          }
        };
      },
      getPlaceDetails: function (placeId) {
        var that = this;

        return $q.all([
          pdFrontendPlacesApi.getPlaceDetails(placeId),
          pdFrontendPlacesApi.getPlaceDeadmans(placeId),
          pdFrontendPlacesApi.getPlaceOrders(placeId),
          pdFrontendPlacesApi.getPlaceAttachments(placeId)
        ]).then(function (results) {
          var placeModel = results[0];
          placeModel.locationYandexPoint = that.getPlaceYandexPoint(placeModel);
          placeModel.deadmans = results[1];
          placeModel.orders = results[2];
          placeModel.attachments = results[3];

          return placeModel;
        });
      },
      addPlace: function (placeModel) {
        return pdFrontendPlacesApi.postPlace(
          placeModel.name,
          placeModel.address,
          placeModel.location.longitude,
          placeModel.location.latitude
        );
      }
    };
  })
  .factory('CatalogMyPlaces', function (pdYandex, user, growl, $rootScope, $q) {
    return function () {
      var MARKER_CURRENT_PRESET = 'twirl#redIcon',
        MARKER_PLACE_PRESET = 'twirl#darkgreenIcon',
        MARKER_REGULAR_PLACE_PRESET = 'twirl#darkgreenDotIcon';
      var currentPlaceGeoObject,
        placeFormError;

      var createPlacemark = function (coords, placeData) {
          return {
            geometry: {
              type: 'Point',
              coordinates: placeData ? [placeData.location.longitude, placeData.location.latitude] : coords
            },
            properties: {
              type: 'users_place',
              placeData: placeData || {}
            },
            options: {
              preset: MARKER_CURRENT_PRESET,
              draggable: true
            }
          };
        },
        getPlacemarkFromYaGeoObject = function (yaGeoObject) {
          return createPlacemark(null, _.cloneDeep(yaGeoObject.properties.get('placeData')));
        },
        getAddress = function (coords) {
          pdYandex.reverseGeocode(coords).then(function (res) {
            currentPlaceGeoObject.properties.placeData.address = res.text;
          });
        },
        convertYaGeoObject2Place = function (geoObject) {
          return _.merge(geoObject.properties.placeData, {
            location: {
              longitude: geoObject.geometry.coordinates[0],
              latitude: geoObject.geometry.coordinates[1]
            }
          });
        },
        getRegularPlaceGeoObject = function (placeModel) {
          return _.merge(createPlacemark(null, placeModel), {
            options: {
              draggable: false,
              preset: MARKER_REGULAR_PLACE_PRESET
            }
          });
        },
        getCustomPlaceGeoObject = function (placeModel) {
          return _.merge(createPlacemark(null, placeModel), {
            options: {
              draggable: false,
              preset: MARKER_PLACE_PRESET
            }
          });
        },
        placesGeoObjects = [],
        loadMyPlaces = function () {
          return $q.all([user.getPlaces(), user.getCustomPlaces()])
            .then(function (result) {
              placesGeoObjects = []
                .concat(_.map(result[0].places || [], getRegularPlaceGeoObject))
                .concat(_.map(result[1], getCustomPlaceGeoObject));
            });
        },
        findPlaceGeoObject = function (placeId) {
          return _.find(placesGeoObjects, {properties: {placeData: {id: placeId}}});
        },
        hideOriginalPlaceMarker = function () {
          var editableGeoObject = findPlaceGeoObject(currentPlaceGeoObject.properties.placeData.id);
          if (editableGeoObject) {
            editableGeoObject.options.visible = false;
          }
        },
        showOriginalPlaceMarker = function () {
          var editableGeoObject = findPlaceGeoObject(currentPlaceGeoObject.properties.placeData.id);
          if (editableGeoObject) {
            editableGeoObject.options.visible = true;
          }
        }
        ;

      // initial load my places
      loadMyPlaces();
      // Save unsaved user's places when client logged in
      $rootScope.$on('auth.signin_success', function () {
        user.saveUnsavedPlaces().then(function (savedPlacesCount) {
          if (savedPlacesCount > 0) {
            growl.addSuccessMessage('Все места были успешно сохранены');
          }
        });
      });

      return {
        loadMyPlaces: loadMyPlaces,
        getPlacesGeoObjects: function () {
          return placesGeoObjects;
        },
        getSelectedPlaceGeoObject: function () {
          return currentPlaceGeoObject;
        },
        cancelEdit: function () {
          showOriginalPlaceMarker();
          currentPlaceGeoObject = null;
        },
        yaMapClickHandle: function (event) {
          if (!currentPlaceGeoObject) {
            return;
          }

          var coords = event.get('coords');
          // change locations of store marker position
          currentPlaceGeoObject.geometry.coordinates = coords;
          getAddress(coords);
        },
        addBtnYaMapHandle: function (event) {
          var map = event.get('target').getParent().getMap();

          currentPlaceGeoObject = createPlacemark(map.getCenter());
          this.addDeceased();
          getAddress(map.getCenter());
          // reset previous error message
          placeFormError = null;
        },
        selectedGeoObjectDragendHandler: function (event) {
          getAddress(event.get('target').geometry.getCoordinates());
          currentPlaceGeoObject.geometry.coordinates = event.get('target').geometry.getCoordinates();
        },
        editPlaceGeoObject: function (event) {
          currentPlaceGeoObject = getPlacemarkFromYaGeoObject(event.get('target'));
          hideOriginalPlaceMarker();
        },
        addNewPlaceFromSelected: function () {
          var addedGeoObject = _.cloneDeep(currentPlaceGeoObject);
          // reset previous error if exist
          placeFormError = null;

          user.addCustomPlace(convertYaGeoObject2Place(addedGeoObject))
            .then(function () {
              addedGeoObject.options.preset = MARKER_PLACE_PRESET;
              addedGeoObject.options.draggable = false;
              placesGeoObjects.push(addedGeoObject);
              // Reset current place
              currentPlaceGeoObject = null;
              growl.addSuccessMessage('Место было успешно добавлено');
            }, function (errorData) {
              placeFormError = errorData.message;
            });
        },
        savePlaceFromSelected: function () {
          var geoObject = _.cloneDeep(currentPlaceGeoObject);
          // reset previous error if exist
          placeFormError = null;

          user.saveCustomPlace(convertYaGeoObject2Place(geoObject))
            .then(function () {
              // Update placemarker
              var updatedPlacemarkGeoObject = findPlaceGeoObject(geoObject.properties.placeData.id);
              updatedPlacemarkGeoObject.properties.placeData = geoObject.properties.placeData;
              updatedPlacemarkGeoObject.geometry = geoObject.geometry;
              updatedPlacemarkGeoObject.options.preset = MARKER_PLACE_PRESET;
              updatedPlacemarkGeoObject.options.draggable = false;
              updatedPlacemarkGeoObject.options.visible = true;
              // Reset current place
              currentPlaceGeoObject = null;
              growl.addSuccessMessage('Место было успешно сохранено');
            }, function (errorData) {
              placeFormError = errorData.message;
            });
        },
        addDeceased: function () {
          if (!currentPlaceGeoObject.properties.placeData.deadmens) {
            currentPlaceGeoObject.properties.placeData.deadmens = [];
          }

          currentPlaceGeoObject.properties.placeData.deadmens.push({
            firstname: null,
            lastname: null,
            middlename: null,
            birthDate: null,
            deathDate: null
          });
        },
        removeDeceased: function (deadmen) {
          _.remove(currentPlaceGeoObject.properties.placeData.deadmens, deadmen);
        },
        getPlaceFormError: function () {
          return placeFormError;
        },
        isExistsUnsavedPlaces: user.isExistsUnsavedPlaces,
        getPlacesBounds: function () {
          return pdYandex.getBoundsByPoints(_.map(placesGeoObjects, function (placeGeoObjectModel) {
            var placeModel = placeGeoObjectModel.properties.placeData;

            return {
              latitude: placeModel.location.latitude,
              longitude: placeModel.location.longitude
            };
          }));
        }
      };
    };
  })
;
