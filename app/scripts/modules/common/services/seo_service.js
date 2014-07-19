'use strict';

angular.module('pdCommon')
  // SEO interceptor for wait finish all requests
  .service('seoSnapshotReadyInterceptor', function ($injector, $timeout, $rootScope) {
    return {
      response: function (response) {
        // Circular refference error for $http service
        var $http = $injector.get('$http');
        if (!$http.pendingRequests.length) {
          $timeout(function () {
            if (!$http.pendingRequests.length) {
              $rootScope.htmlReady();
            }
          }, 1000);
        }

        return response;
      }
    };
  })
;
