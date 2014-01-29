'use strict';

angular.module('pdCommon')
  .service('auth', function ($http, pdConfig, storage, $q) {
    var signin = function (username, password) {
        return $http.post(pdConfig.apiEndpoint + 'auth/signin', {
            username: username,
            password: password
          }).then(function (response) {
            var responseData = response.data;

            if (_.has(responseData, 'token')) {
              storage.set(pdConfig.AUTH_TOKEN_KEY, responseData.token);
            }

            if (_.has(responseData, 'role')) {
              responseData.role = _.isString(responseData.role) ? [responseData.role] : responseData.role;
              storage.set(pdConfig.AUTH_ROLES_KEY, responseData.role);
            }

            return responseData;
          }, function (errorResponse) {
            var respData = errorResponse.data,
              defaultReturnData = {
                errorCode: null,
                message: 'Неизвестная ошибка'
              };

            if (400 === errorResponse.status && 'error' === respData.status) {
              respData = _(respData)
                .pick(['errorCode', 'message'])
                .defaults(defaultReturnData)
                .value();

              return $q.reject(respData);
            }

            return $q.reject(defaultReturnData);
          });
      },
      signout = function () {
        storage.remove(pdConfig.AUTH_TOKEN_KEY);
        storage.remove(pdConfig.AUTH_ROLES_KEY);
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
        }).then(function (responseData) {
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
          $location.path('/');
        }

        return $q.reject(rejection);
      }
    };
  })
;
