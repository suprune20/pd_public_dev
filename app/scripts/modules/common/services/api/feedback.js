'use strict';

angular.module('pdCommon')
  .service('feedback', function ($http, pdConfig, $q, storage) {
    return {
      save: function (feedbackData) {
        return $http.post(pdConfig.apiEndpoint + 'feedback', feedbackData, {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          // Update user profile in locale storage
          var currentUserData = storage.get(pdConfig.AUTH_PROFILE_KEY);
          currentUserData.profile.firstname = feedbackData.firstName;
          currentUserData.profile.lastname = feedbackData.lastName;
          currentUserData.profile.middleName = feedbackData.middleName;
          storage.set(pdConfig.AUTH_PROFILE_KEY, currentUserData);

          return resp.data;
        }, function (errorResponse) {
          return $q.reject(errorResponse.data);
        });
      }
    };
  })
;