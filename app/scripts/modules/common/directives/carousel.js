'use strict';

angular.module('pdCommon')
  .directive('pdCarousel', function ($timeout) {
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      template: '<div class="jcarousel">' +
          '<ul ng-transclude></ul>' +
          '<a href="#" class="jcarousel-control-prev hide-btn">&lsaquo;</a>' +
          '<a href="#" class="jcarousel-control-next hide-btn">&rsaquo;</a>' +
        '</div>',
      link: function (scope, iElement, iAttrs) {
        var prevBtn = iElement.find('.jcarousel-control-prev'),
          nextBtn = iElement.find('.jcarousel-control-next'),
          showAllControls = function () {
            prevBtn.removeClass('hide-btn');
            nextBtn.removeClass('hide-btn');
          };

        $timeout(function () {
          if (_.has(iAttrs, 'pdCarouselResponsive')) {
            iElement
              .on('jcarousel:reload jcarousel:create', function () {
                setTimeout(function () {
                  var width = iElement.innerWidth(),
                    itemsCount = iElement.jcarousel('items').length;

                  if (width >= 600) {
                    width = width / 3;
                    if (itemsCount > 3) {
                      showAllControls();
                    }
                  } else if (width >= 350) {
                    width = width / 2;
                    if (itemsCount > 2) {
                      showAllControls();
                    }
                  } else if (itemsCount > 1) {
                    showAllControls();
                  }

                  iElement.jcarousel('items').css('width', width + 'px');
                }, 50);
              });
          }
          // Create carousel instance
          iElement.jcarousel();
          // Bind carousel controls
          iElement.find('.jcarousel-control-prev')
            .jcarouselControl({
              target: '-=1'
            });
          iElement.find('.jcarousel-control-next')
            .jcarouselControl({
              target: '+=1'
            });
          // Reload jcarousel when change items counter
          scope.$watch(function () {
            return iElement.find('li').length;
          }, function (newItemsCount, oldItemsCount) {
            if (newItemsCount !== oldItemsCount) {
              iElement.jcarousel('reload');
            }
          });
          // Clear jcarousel instance
          scope.$on('$destroy', function () {
            iElement.jcarousel('destroy');
          });
        });
      }
    };
  })
;
