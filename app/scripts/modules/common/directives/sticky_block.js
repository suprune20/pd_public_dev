'use strict';

angular.module('pdCommon')
  .directive('pbStickyBlock', function ($window, $log, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, iElement, iAttrs) {
        // Wrap into zero-timeout-fix: wrong block position coords after change route, maybe angularjs animation
        // ToDo: Check on a new angular.js animation version > 1.2.10
        $timeout(function () {
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
        }, 0);
      }
    };
  })
;
