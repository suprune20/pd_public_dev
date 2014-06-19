'use strict';

angular.module('pdFrontend')
  .service('user', function ($http, pdHttp, pdConfig, pdYandex, $q, $upload, auth, storage, $filter) {
    var CUSTOM_PLACES_BASE_URL = pdConfig.apiEndpoint + 'client/customplaces';

    return {
      getCurrentUserProfile: function () {
        return auth.getUserProfile();
      },
      getPlaces: function () {
        if (!auth.isAuthenticated() || !auth.isCurrentHasClientRole()) {
          return $q.when({});
        }

        return $http.get(pdConfig.apiEndpoint + 'profile', {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
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
        return pdHttp.post(CUSTOM_PLACES_BASE_URL, placeModel);
      },
      getCustomPlaces: function () {
        return pdHttp.get(CUSTOM_PLACES_BASE_URL);
      },
      saveCustomPlace: function (placeId, placeData) {
        return pdHttp.put(CUSTOM_PLACES_BASE_URL + '/' + placeId, placeData);
      },
      deleteCustomPlace: function (placeId) {
        return pdHttp.delete(CUSTOM_PLACES_BASE_URL + '/' + placeId);
      },
      saveSettings: function (settingsData) {
        var saveUrl = pdConfig.apiEndpoint + 'settings';

        if (settingsData.userPhoto) {
          return $upload.upload({
            url: saveUrl,
            tracker: 'commonLoadingTracker',
            data: settingsData,
            file: settingsData.userPhoto,
            fileFormDataName: 'userPhoto'
          });
        }

        return $http.put(saveUrl, settingsData, {tracker: 'commonLoadingTracker'})
          .then(function () {
            // Update user profile in locale storage
            var currentUserData = storage.get(pdConfig.AUTH_PROFILE_KEY);

            currentUserData.profile.mainPhone = settingsData.mainPhone || currentUserData.profile.mainPhone;
            currentUserData.profile.email = _.has(settingsData, 'email') ?
              settingsData.email :
              currentUserData.profile.email;
            storage.set(pdConfig.AUTH_PROFILE_KEY, currentUserData);
          }, function (errorResp) {
            var respData = errorResp.data;

            if (_.has(respData, 'message')) {
              respData.message = _.isArray(respData.message) ? respData.message : [respData.message];
            }

            return $q.reject(respData);
          });
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
        return pdHttp.delete(pdConfig.apiEndpoint + 'user')
          .then(function () {
            storage.remove(pdConfig.AUTH_TOKEN_KEY);
            storage.remove(pdConfig.AUTH_ROLES_KEY);
          });
      },
      addOAuthProvider: function (providerId, accessToken) {
        return $http.post(pdConfig.apiEndpoint + 'settings/oauth_providers', {
          provider: providerId,
          accessToken: accessToken
        }, { tracker: 'commonLoadingTracker' }).then(function (response) {
          return response.data;
        }, function (errorResponse) { return $q.reject(errorResponse.data); });
      },
      removeOAuthProvider: function (providerId) {
        return $http.delete(pdConfig.apiEndpoint + 'settings/oauth_providers/' + providerId, null, {
          tracker: 'commonLoadingTracker'
        });
      }
    };
  })
;
