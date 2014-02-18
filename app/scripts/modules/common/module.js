'use strict';

angular.module('pdCommon', [
    'pdConfig',
    'ui.bootstrap',
    'angularLocalStorage',
    'ajoslin.promise-tracker',
    'ivpusic.cookie',
    'angular-growl'
  ])
  .config(function (growlProvider) {
    growlProvider.globalTimeToLive(5000);
  })
  .run(function ($rootScope, promiseTracker) {
    $rootScope.commonLoadingTracker = promiseTracker('commonLoadingTracker');
  })
;
