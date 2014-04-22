'use strict';

angular.module('pdCommon', [
    'ngRoute',
    'pdConfig',
    'ui.bootstrap',
    'angularLocalStorage',
    'ajoslin.promise-tracker',
    'ivpusic.cookie',
    'angular-growl',
    'angularFileUpload',
    'checklist-model'
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
  // Route provider with check allowed roles
  .provider('authRoute', ['$routeProvider', function ($routeProvider) {
    return angular.extend({}, $routeProvider, {
      when: function(path, route, allowedRoles) {
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, { isAllowedAccess: ['$q', 'auth', function ($q, auth) {
          var deferred = $q.defer();

          if (auth.isContainsRole(allowedRoles)) {
            deferred.resolve();
          } else {
            deferred.reject({ accessDenied: true });
          }

          return deferred.promise;
        }
        ]});

        return $routeProvider.when(path, route);
      }
    });
  }])
;
