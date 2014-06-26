'use strict';

angular.module('pdCommon')
  .filter('pdThumbnail', function (pdThumbnailer) {
    return pdThumbnailer.getThumbnailUrl;
  })
;
