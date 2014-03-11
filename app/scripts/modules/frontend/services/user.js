'use strict';

angular.module('pdFrontend')
  .factory('user', function ($http, pdConfig, pdYandex, $q, $upload, auth, storage, $filter) {
    return {
      getCurrentUserProfile: function () {
        return auth.getUserProfile();
      },
      getPlaces: function () {
        return $http.get(pdConfig.apiEndpoint + 'cabinet', {
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
            currentUserData.profile.mainPhone = _.has(settingsData, 'mainPhone') ?
              settingsData.mainPhone :
              currentUserData.profile.mainPhone;
            storage.set(pdConfig.AUTH_PROFILE_KEY, currentUserData);
          }, function (errorResp) {
            var respData = errorResp.data;

            if (_.has(respData, 'message')) {
              respData.message = _.isArray(respData.message) ? respData.message : [respData.message];
            }

            return $q.reject(respData);
          });
      },
      removeAccount: function () {
        $http.delete(pdConfig.apiEndpoint + 'user', null, {tracker: 'commonLoadingTracker'});
      }
    };
  })
;
