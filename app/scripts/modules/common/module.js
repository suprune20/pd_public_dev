'use strict';

angular.module('pdCommon', [
    'pdConfig',
    'ui.bootstrap',
    'angularLocalStorage',
    'ajoslin.promise-tracker',
    'ivpusic.cookie',
    'angular-growl',
    'angularFileUpload'
  ])
  .config(function (growlProvider) {
    growlProvider.globalTimeToLive(5000);
  })
  .run(function ($rootScope, promiseTracker) {
    $rootScope.commonLoadingTracker = promiseTracker('commonLoadingTracker');
  })
  .factory('httpErrorsInterceptor', function (pdConfig, $q, growl) {
    var apiUrlRegexp = new RegExp('^' + pdConfig.apiEndpoint);

    return {
      responseError: function (rejection) {
        if (_.has(rejection.config, 'url') &&
          apiUrlRegexp.test(rejection.config.url) &&
          500 === rejection.status
        ) {
          growl.addErrorMessage('Произошла ошибка на сервере. Сообщите администрации сайта.');
        }

        return $q.reject(rejection);
      }
    };
  })
;
