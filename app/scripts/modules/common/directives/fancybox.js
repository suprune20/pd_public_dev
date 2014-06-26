'use strict';

angular.module('pdCommon')
//  .directive('pbFancybox', function () {
//    return {
//      restrict: 'AE',
//      link: function (scope, iElement, iAttrs) {
//        var isApplied = false;
//
//        iAttrs.$observe('href', function (hrefValue) {
//          if (!hrefValue || isApplied) {
//            return;
//          }
//
//          iElement.fancybox();
//          isApplied = true;
//        });
//      }
//    };
//  })
  .directive('pdFancybox', function () {
    return {
      restrict: 'EA',
      controller: function ($scope) {
        this.setTitle = function (titleText) {
          $scope.fancyboxTitle = titleText;
        };
      },
      link: function (scope, element, attrs) {
        element.on('click', function () {
          console.log('click', attrs.pdFancybox, scope.fancyboxTitle);
          $.fancybox.open([{
            href: attrs.pdFancybox,
            title: scope.fancyboxTitle
          }]);
        });
      }
    };
  })
  .directive('pdFancyboxTitle', function () {
    return {
      restrict: 'EA',
      require:'^pdFancybox',
      link: function (scope, element, attrs, pdFancyboxCtrl) {
        element.css('display', 'none');
        scope.$watch(function () {
          return element.html();
        }, function (titleContent) {
          pdFancyboxCtrl.setTitle(titleContent);
        });
      }
    };
  })
  .directive('pbFancyboxGallery', function (pdThumbnailer) {
    return {
      restrict: 'AE',
      link: function (scope, iElement, iAttrs) {
        var isApplied = false;

        iAttrs.$observe('pbFancyboxGallery', function (gallery) {
          gallery = scope.$eval(gallery);
          if (!(gallery && gallery.length) || isApplied) {
            return;
          }

          iElement.on('click', function (event) {
            $.fancybox.open(gallery, {
              helpers: {
                thumbs: {
                  width  : 40,
                  height : 40,
                  source  : function (current) {
                    var thumbnail = pdThumbnailer.getThumbnailUrl(current.href, '40x40');

                    return thumbnail ? thumbnail : current.href;
                  }
                }
              }
            });

            event.stopPropagation();
          });
          isApplied = true;
        });
      }
    };
  })
;
