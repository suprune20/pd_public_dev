'use strict';

angular.module('pdApp')
  .directive('pbStickyBlock', function ($window, $log) {
    return {
      restrict: 'AE',
      link: function (scope, iElement, iAttrs) {
        var stickyTopPosition = iAttrs.hasOwnProperty('topPosition') ? parseInt(iAttrs.topPosition, 10) : 0,
            stickyScrollDelta = iElement.offset().top - stickyTopPosition;

        if (stickyScrollDelta <= 0) {
          $log.warn('pbStickyBlock directive: needed stick position should be higher than current');
          return;
        }

        angular.element($window).on('scroll', function () {
          if (this.pageYOffset >= stickyScrollDelta) {
            iElement.addClass('pb-sticky-block');
          } else {
            iElement.removeClass('pb-sticky-block');
          }
        });
      }
    };
  })
;
