'use strict';

angular.module('pdApp')
  .service('auth', function ($http, pdConfig, storage, $q) {
    var AUTH_TOKEN_KEY = 'auth.token',
      signin = function (username, password) {
        return $http.post(pdConfig.apiEndpoint + 'signin', {
            username: username,
            password: password
          }).then(function (response) {
            var responseData = response.data;

            if (_.has(responseData, 'token')) {
              storage.set(AUTH_TOKEN_KEY, responseData.token);
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
        storage.remove(AUTH_TOKEN_KEY);
      },
      isAuthenticated = function () {
        return !!storage.get(AUTH_TOKEN_KEY);
      },
      getAuthToken = function () {
        return storage.get(AUTH_TOKEN_KEY);
      };

    return {
      signin: signin,
      signout: signout,
      isAuthenticated: isAuthenticated,
      getAuthToken: getAuthToken
    };
  })
;
