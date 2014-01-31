'use strict';

angular.module('pdCommon', [
    'pdConfig',
    'ui.bootstrap',
    'angularLocalStorage',
    'ajoslin.promise-tracker'
  ])
  .run(function ($rootScope, promiseTracker) {
    $rootScope.commonLoadingTracker = promiseTracker('commonLoadingTracker');
  })
;
