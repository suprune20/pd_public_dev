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
  .config(function (growlProvider, $provide) {
    growlProvider.globalTimeToLive(5000);
    // Allow dynamic set names for form elements
    $provide.decorator('ngModelDirective', function ($delegate) {
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
    });
    $provide.decorator('formDirective', function ($delegate) {
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
    });
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
      when: function (path, route, allowedRoles) {
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
        $routeProvider.when(path, route);

        return this;
      }
    });
  }])
;
