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

            return responseData;
          }, function (errorResponse) {
            var respData = errorResponse.data;

            if (400 === errorResponse.status && 'error' === respData.status) {
              return $q.reject('Неверный номер телефона или пароль');
            }

            return $q.reject('Неизвестная ошибка');
          });
      },
      signout = function () {
        storage.remove(pdConfig.AUTH_TOKEN_KEY);
      },
      isAuthenticated = function () {
        return !!storage.get(pdConfig.AUTH_TOKEN_KEY);
      },
      getAuthToken = function () {
        return storage.get(pdConfig.AUTH_TOKEN_KEY);
      };

    return {
      signin: signin,
      signout: signout,
      isAuthenticated: isAuthenticated,
      getAuthToken: getAuthToken
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
          $location.path('/signin');
        }

        return $q.reject(rejection);
      }
    };
  })
;
