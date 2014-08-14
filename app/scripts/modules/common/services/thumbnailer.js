'use strict';

angular.module('pdCommon')
  .service('pdThumbnailer', function (pdConfig) {
    var getThumbnailUrl = function (imageUrl, size, method) {
        if (!imageUrl) {
          return null;
        }

        var thumbSize = size || '120x100',
          thumbMethod = method || 'crop',
          baseUrlRegexp = new RegExp('^' + pdConfig.imageThumbnailerConfig.baseUrl),
          imageExt = imageUrl.split('.').pop();

        if (baseUrlRegexp.test(imageUrl) && thumbSize && imageExt) {
          return imageUrl.replace(baseUrlRegexp, pdConfig.imageThumbnailerConfig.thumbnailBaseUrl) +
            '/' + thumbSize + '~' + thumbMethod + '~12.' + imageExt;
        }

        return null;
      }
    ;

    return {
      getThumbnailUrl: getThumbnailUrl
    };
  })
;
