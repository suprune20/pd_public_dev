'use strict';

angular.module('pdFrontend')
  .service('user', function ($http, pdSimpleHttp, pdConfig, pdYandex, $q, $upload, auth, authStorage, storage,
                             $filter) {
    var CUSTOM_PLACES_BASE_URL = pdConfig.apiEndpoint + 'client/customplaces';
    var CUSTOM_PLACES_STORAGE_KEY = 'pd.custom_places';

    return {
      getCurrentUserProfile: function () {
        return auth.getUserProfile();
      },
      getPlaces: function () {
        if (!auth.isAuthenticated() || !auth.isCurrentHasClientRole()) {
          return $q.when({});
        }

        return $http.get(pdConfig.apiEndpoint + 'profile')
          .then(function (resp) {
            var userProfileData = resp.data;

            userProfileData.places.map(function (placeData) {
              if (placeData.location && (!placeData.location.longitude || !placeData.location.latitude)) {
                placeData.location = null;
              }

              // Sort and formatting gallery data for fancybox
              placeData.gallery = _(placeData.gallery)
                .sortBy('addedAt')
                .reverse()
                .map(function (galleryItem) {
                  galleryItem.href = galleryItem.photo;
                  galleryItem.title = $filter('momentDate')(galleryItem.addedAt, 'DD-MM-YYYY HH:mm');

                  return galleryItem;
                })
                .value()
              ;
              placeData.mainPhoto = _.first(placeData.gallery);

              return placeData;
            });

            return userProfileData;
          });
      },
      getAllPlaces: function () {
        return $q.all([this.getPlaces(), this.getCustomPlaces()])
          .then(function (results) {
            var registeredPlaces = _.map(results[0].places, function (placeData) {
              placeData.type = 'registered';

              return placeData;
            });
            var customPlaces = _.map(results[1], function (placeData) {
              placeData.type = 'custom';
              // create graves attribute as in regular places output
              placeData.graves = [];
              if (placeData.deadmens.length) {
                placeData.graves.push({
                  burials: _.map(placeData.deadmens, function (deadmanData) {
                    // convert attributes as in regular places api output
                    deadmanData.fio = [deadmanData.firstname, deadmanData.lastname, deadmanData.middlename].join(' ');

                    return deadmanData;
                  })
                });
              }
              delete placeData.deadmens;

              return placeData;
            });

            return registeredPlaces.concat(customPlaces);
          });
      },
      getPlaceCoordinates: function (placeData) {
        var deferred = $q.defer();

        if (placeData.location) {
          deferred.resolve([placeData.location.longitude, placeData.location.latitude]);
        } else if (placeData.address) {
          pdYandex.geocode(placeData.address).then(deferred.resolve, deferred.reject);
        } else {
          deferred.reject('Wrong place data: no location and address attributes');
        }

        return deferred.promise;
      },
      addCustomPlace: function (placeModel) {
        if (!auth.isAuthenticated()) {
          var places = storage.get(CUSTOM_PLACES_STORAGE_KEY) || [];
          placeModel.id = 'custom_inner_place_' + _.now();
          places.push(placeModel);
          storage.set(CUSTOM_PLACES_STORAGE_KEY, places);

          return $q.when();
        }

        return pdSimpleHttp.post(CUSTOM_PLACES_BASE_URL, placeModel);
      },
      getCustomPlaces: function () {
        var unsavedPlaces = storage.get(CUSTOM_PLACES_STORAGE_KEY) || [];

        // Read custom user's places from localstorage for non clients users
        if (!auth.isCurrentHasClientRole()) {
          return $q.when(unsavedPlaces);
        }

        return pdSimpleHttp.get(CUSTOM_PLACES_BASE_URL)
          .then(function (placesData) {
            placesData = placesData || [];

            return placesData.concat(unsavedPlaces);
          });
      },
      saveCustomPlace: function (placeData) {
        var innerPlaces = storage.get(CUSTOM_PLACES_STORAGE_KEY) || [],
          editableInnerPlace = _.find(innerPlaces, {id: placeData.id});

        if (editableInnerPlace) {
          _.merge(editableInnerPlace, placeData);
          storage.set(CUSTOM_PLACES_STORAGE_KEY, innerPlaces);
          return $q.when();
        }

        return pdSimpleHttp.put(CUSTOM_PLACES_BASE_URL + '/' + placeData.id, placeData);
      },
      deleteCustomPlace: function (placeId) {
        var innerPlaces = storage.get(CUSTOM_PLACES_STORAGE_KEY) || [],
          removableInnerPlace = _.find(innerPlaces, {id: placeId});

        if (removableInnerPlace) {
          _.remove(innerPlaces, {id: placeId});
          storage.set(CUSTOM_PLACES_STORAGE_KEY, innerPlaces);
          return $q.when();
        }

        return pdSimpleHttp.delete(CUSTOM_PLACES_BASE_URL + '/' + placeId);
      },
      isExistsUnsavedPlaces: function () {
        return !!(storage.get(CUSTOM_PLACES_STORAGE_KEY) || []).length;
      },
      saveUnsavedPlaces: function () {
        if (!auth.isCurrentHasClientRole()) {
          return;
        }

        var unsavedPlaces = storage.get(CUSTOM_PLACES_STORAGE_KEY) || [],
          allPromises = _.map(_.clone(unsavedPlaces), function (placeData) {
            return this.addCustomPlace(placeData)
              .then(function () {
                _.remove(unsavedPlaces, placeData);
              });
          }, this);

        return $q.all(allPromises)
          .then(function () {
            return allPromises.length;
          })
          .finally(function () {
            storage.set(CUSTOM_PLACES_STORAGE_KEY, unsavedPlaces);
          });
      },
      saveSettings: function (settingsData, userAvatarFile) {
        var saveUrl = pdConfig.apiEndpoint + 'settings';
        // convert lowercase notation into camelcase
        if (settingsData.firstname) {
          settingsData.firstName = settingsData.firstname;
        }
        if (settingsData.lastname) {
          settingsData.lastName = settingsData.lastname;
        }
        if (settingsData.middlename) {
          settingsData.middleName = settingsData.middlename;
        }

        if (userAvatarFile && userAvatarFile instanceof File) {
          return $upload.upload({
            url: saveUrl,
            method: 'PUT',
            tracker: 'commonLoadingTracker',
            data: settingsData,
            file: userAvatarFile,
            fileFormDataName: 'avatar'
          }).then(function (response) { return response.data; });
        }

        return $http.put(saveUrl, settingsData)
          .then(function () {
            // Update user profile
            var currentUserData = authStorage.getProfile();

            currentUserData.profile.mainPhone = settingsData.mainPhone || currentUserData.profile.mainPhone;
            currentUserData.profile.email = _.has(settingsData, 'email') ?
              settingsData.email :
              currentUserData.profile.email;
            currentUserData.profile.firstname = settingsData.firstname || currentUserData.profile.firstname;
            currentUserData.profile.lastname = settingsData.lastname || currentUserData.profile.lastname;
            currentUserData.profile.middlename = settingsData.middlename || currentUserData.profile.middlename;
            authStorage.setProfile(currentUserData);
          }, function (errorResp) {
            var respData = errorResp.data;

            if (_.has(respData, 'message')) {
              respData.message = _.isArray(respData.message) ? respData.message : [respData.message];
            }

            return $q.reject(respData);
          });
      },
      updateUserAvatar: function (userAvatarFile) {
        if (!(userAvatarFile instanceof File)) {
          return $q.reject();
        }

        return this.saveSettings({}, userAvatarFile)
          .then(function (userData) { return userData.avatarUrl; });
      },
      getSettings: function () {
        return $http.get(pdConfig.apiEndpoint + 'settings')
          .then(function (response) {
            var settingsData = response.data;
            settingsData.oauthProviders = _.indexBy(settingsData.oauthProviders, 'id');

            return settingsData;
          });
      },
      removeAccount: function () {
        return pdSimpleHttp.delete(pdConfig.apiEndpoint + 'user')
          .then(function () {
            authStorage.clearAll();
          });
      },
      addOAuthProvider: function (providerId, accessToken) {
        return $http.post(pdConfig.apiEndpoint + 'settings/oauth_providers', {
          provider: providerId,
          accessToken: accessToken
        }).then(function (response) {
          return response.data;
        }, function (errorResponse) { return $q.reject(errorResponse.data); });
      },
      removeOAuthProvider: function (providerId) {
        return $http.delete(pdConfig.apiEndpoint + 'settings/oauth_providers/' + providerId);
      }
    };
  })
;
