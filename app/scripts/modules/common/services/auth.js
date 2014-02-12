'use strict';

angular.module('pdCommon')
  .service('auth', function ($http, pdConfig, storage, ipCookie, $q, $rootScope) {
    var signin = function (username, password) {
        return $http.post(pdConfig.apiEndpoint + 'auth/signin', {
            username: username,
            password: password
          }, {tracker: 'commonLoadingTracker'}).then(function (response) {
            var responseData = response.data;

            if (_.has(responseData, 'token')) {
              storage.set(pdConfig.AUTH_TOKEN_KEY, responseData.token);
            }

            // Set session cookie for "old" django backend
            if (_.has(responseData, 'sessionId')) {
              ipCookie('pdsession', responseData.sessionId, {domain: pdConfig.AUTH_COOKIE_DOMAIN});
            }

            if (_.has(responseData, 'role')) {
              responseData.role = _.isString(responseData.role) ? [responseData.role] : responseData.role;
              storage.set(pdConfig.AUTH_ROLES_KEY, responseData.role);
            }

            return responseData;
          }, function (errorResponse) {
            var respData = errorResponse.data;
            respData.errorCode = 'undefined_error';

            if (400 === errorResponse.status) {
              respData.errorCode = 'wrong_credentials';
            }

            return $q.reject(respData);
          });
      },
      signout = function () {
        ipCookie('pdsession', 'wrong_session', {domain: pdConfig.AUTH_COOKIE_DOMAIN});
        storage.remove(pdConfig.AUTH_TOKEN_KEY);
        storage.remove(pdConfig.AUTH_ROLES_KEY);
        $rootScope.$broadcast('auth.signout');
      },
      isAuthenticated = function () {
        return !!storage.get(pdConfig.AUTH_TOKEN_KEY);
      },
      getAuthToken = function () {
        return storage.get(pdConfig.AUTH_TOKEN_KEY);
      },
      getRoles = function () {
        return storage.get(pdConfig.AUTH_ROLES_KEY);
      },
      getPasswordBySMS = function (username, captchaData) {
        return $http.post(pdConfig.apiEndpoint + 'auth/get_password_by_sms', {
          phoneNumber: username,
          recaptchaData: captchaData
        }, {tracker: 'commonLoadingTracker'}).then(function (responseData) {
          return responseData.data;
        }, function (responseData) {
          return $q.reject(responseData.data);
        });
      },
      isContainsRole = function (role) {
        return _.contains(getRoles(), role);
      },
      isCurrentHasClientRole = function () {
        return isContainsRole('ROLE_CLIENT');
      },
      isCurrentHasLoruRole = function () {
        return isContainsRole('ROLE_LORU');
      },
      isCurrentHasOmsRole = function () {
        return isContainsRole('ROLE_OMS');
      };

    return {
      signin: signin,
      signout: signout,
      isAuthenticated: isAuthenticated,
      getAuthToken: getAuthToken,
      getRoles: getRoles,
      getPasswordBySMS: getPasswordBySMS,
      isCurrentHasClientRole: isCurrentHasClientRole,
      isCurrentHasLoruRole: isCurrentHasLoruRole,
      isCurrentHasOmsRole: isCurrentHasOmsRole
    };
  })
  .factory('authApiInterceptor', function ($q, $location, pdConfig, storage) {
    var apiUrlRegexp = new RegExp('^' + pdConfig.apiEndpoint);

    return {
      request: function (config) {
        // If access forbidden response from api then redirect to signin page
        // ToDo: circular reference if use auth or security services
        if (apiUrlRegexp.test(config.url) && !!storage.get(pdConfig.AUTH_TOKEN_KEY)) {
          config.headers.Authorization = 'Token ' + storage.get(pdConfig.AUTH_TOKEN_KEY);
        }

        return config;
      },
      responseError: function (rejection) {
        // If access forbidden response from api then redirect to signin page
        if (_.has(rejection.config, 'url') && apiUrlRegexp.test(rejection.config.url) && 403 === rejection.status) {
          storage.remove(pdConfig.AUTH_TOKEN_KEY);
          storage.remove(pdConfig.AUTH_ROLES_KEY);
          $location.path('/');
        }

        return $q.reject(rejection);
      }
    };
  })
;
