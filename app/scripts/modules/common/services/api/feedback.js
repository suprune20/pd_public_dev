'use strict';

angular.module('pdCommon')
  .service('feedback', function ($http, pdConfig) {
    return {
      save: function (feedbackData) {
        return $http.post(pdConfig.apiEndpoint + 'feedback', feedbackData, {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data;
        });
      }
    };
  })
;