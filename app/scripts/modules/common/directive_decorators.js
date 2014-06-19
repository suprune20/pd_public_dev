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
    // Allow dynamic set names for form elements
    $provide.decorator('ngModelDirective', ['$delegate', function ($delegate) {
      var ngModel = $delegate[0], controller = ngModel.controller;
      ngModel.controller = ['$scope', '$element', '$attrs', '$injector', function (scope, element, attrs, $injector) {
        var $interpolate = $injector.get('$interpolate');
        attrs.$set('name', $interpolate(attrs.name || '')(scope));
        $injector.invoke(controller, this, {
          '$scope': scope,
          '$element': element,
          '$attrs': attrs
        });
      }];

      return $delegate;
    }]);
    $provide.decorator('formDirective', ['$delegate', function ($delegate) {
      var form = $delegate[0], controller = form.controller;
      form.controller = ['$scope', '$element', '$attrs', '$injector', function (scope, element, attrs, $injector) {
        var $interpolate = $injector.get('$interpolate');
        attrs.$set('name', $interpolate(attrs.name || attrs.ngForm || '')(scope));
        $injector.invoke(controller, this, {
          '$scope': scope,
          '$element': element,
          '$attrs': attrs
        });
      }];

      return $delegate;
    }]);
  })
;
