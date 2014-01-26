'use strict';

angular.module('pdCommon')
  .config(function ($provide) {
    // Use api server thumbnailer for resize images in ngSrc directive
    $provide.decorator('ngSrcDirective', ['$delegate', 'imageThumbnailerConfig',
      function ($delegate, imageThumbnailerConfig) {
        var directive = $delegate[0];

        directive.compile = function() {
          return function(scope, iElement, iAttrs) {
            iAttrs.$observe('ngSrc', function (imageSrcValue) {
              if (!imageSrcValue) {
                return;
              }

              if (_.has(iAttrs, 'pdThumb')) {
                var thumbSize = iAttrs.pdThumbSize || '120x100',
                  thumbMethod = iAttrs.pdThumbMethod || 'crop',
                  baseUrlRegexp = new RegExp('^' + imageThumbnailerConfig.baseUrl),
                  imageExt = imageSrcValue.split('.').pop();

                if (baseUrlRegexp.test(imageSrcValue) && thumbSize && imageExt) {
                  imageSrcValue = imageSrcValue.replace(baseUrlRegexp, imageThumbnailerConfig.thumbnailBaseUrl) +
                    '/' + thumbSize + '~' + thumbMethod + '~12.' + imageExt;
                }
              }

              iAttrs.$set('src', imageSrcValue);
            });
          };
        };

        return $delegate;
      }
    ]);
  })
;
