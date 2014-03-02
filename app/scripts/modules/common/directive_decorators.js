'use strict';

angular.module('pdCommon')
  .config(function ($provide) {
    // Use api server thumbnailer for resize images in ngSrc directive
    $provide.decorator('ngSrcDirective', ['$delegate', 'pdThumbnailer',
      function ($delegate, pdThumbnailer) {
        var directive = $delegate[0];

        directive.compile = function() {
          return function(scope, iElement, iAttrs) {
            iAttrs.$observe('ngSrc', function (imageSrcValue) {
              if (!imageSrcValue) {
                return;
              }

              if (_.has(iAttrs, 'pdThumb')) {
                var thumbnail = pdThumbnailer.getThumbnailUrl(imageSrcValue, iAttrs.pdThumbSize, iAttrs.pdThumbMethod);
                if (thumbnail) {
                  imageSrcValue = thumbnail;
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
