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
  'checklist-model',
  'ui.router',
  'pasvaz.bindonce',
  'xeditable',
  'akoenig.deckgrid',
  'monospaced.elastic',
  'angularMoment'
])
  .config(function (growlProvider) {
    growlProvider.globalTimeToLive(5000);
  })
  .run(function ($rootScope, promiseTracker, editableOptions, amMoment) {
    $rootScope.commonLoadingTracker = promiseTracker('commonLoadingTracker');
    editableOptions.theme = 'bs3';
    amMoment.changeLanguage('ru');
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
  .provider('authRoute', function ($stateProvider) {
    return angular.extend({}, $stateProvider, {
      state: function (name, route, allowedRoles) {
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, { isAllowedAccess: ['$q', 'auth', function ($q, auth) {
          var deferred = $q.defer();

          if (!route.secured ||
            // Check for "non" regular expr string: !ROLE
            ((_.isString(allowedRoles) && '!' === allowedRoles[0]) ?
              !auth.isContainsRole(allowedRoles.substring(1)) :
              auth.isContainsRole(allowedRoles))
          ) {
            deferred.resolve();
          } else {
            deferred.reject({ accessDenied: true });
          }

          return deferred.promise;
        }
        ]});

        // Call parent method
        $stateProvider.state(name, route);

        return this;
      }
    });
  })
;
