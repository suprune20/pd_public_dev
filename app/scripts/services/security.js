'use strict';

angular.module('pdApp')
  .service('security', function ($route, auth) {
    var securedUrls = _($route.routes)
        .filter(function (routeData) {
          return routeData.secured;
        })
        .pluck('originalPath')
        .value(),
      isSecuredUrl = function (url) {
        return _.contains(securedUrls, url);
      },
      isAvailableUrl = function (url) {
        var isSecured = isSecuredUrl(url);

        return (isSecured && auth.isAuthenticated()) ||
          !isSecured;
      }
    ;

    return {
      isSecuredUrl: isSecuredUrl,
      isAvailableUrl: isAvailableUrl
    };
  })
;
