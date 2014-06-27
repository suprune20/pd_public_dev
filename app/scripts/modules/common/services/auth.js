'use strict';

/* jshint -W069 */

angular.module('pdCommon')
  .service('auth', function ($http, pdConfig, authStorage, ipCookie, $q, $rootScope, oauthIO, $upload) {
    var applySuccessSigninResponse = function (responseData) {
        if (_.has(responseData, 'token')) {
          authStorage.setApiAuthToken(responseData.token);
        }

        // Set session cookie for "old" django backend
        if (_.has(responseData, 'sessionId')) {
          ipCookie('pdsession', responseData.sessionId, {domain: pdConfig.AUTH_COOKIE_DOMAIN});
        }

        if (_.has(responseData, 'role')) {
          responseData.role = _.isString(responseData.role) ? [responseData.role] : responseData.role;
          authStorage.setRoles(responseData.role);
        }

        // Save user's profile data into localstorage
        var profileData = {};
        profileData.profile = responseData.profile || {};
        profileData.organisation = responseData.org || {};
        authStorage.setProfile(profileData);

        // Broadcast success signin event
        $rootScope.$broadcast('auth.signin_success');

        return responseData;
      },
      isAuthenticated = function () {
        return authStorage.isAvailableAuthToken();
      },
      getRoles = function () {
        return isAuthenticated() ? authStorage.getRoles() : ['AUTH_ROLE_ANONYMOUS'];
      },
      isContainsRole = function (role) {
        return !!_.intersection(getRoles(), _.isArray(role) ? role : [role]).length;
      }
    ;

    return {
      signin: function (username, password, confirmTC, oauthData) {
        return $http.post(pdConfig.apiEndpoint + 'auth/signin', {
          username: username,
          password: password,
          confirmTC: confirmTC ? true : undefined,
          oauth: oauthData
        }).then(function (response) {
          return applySuccessSigninResponse(response.data);
        }, function (response) {
          var respData = response.data;

          if (respData.errorCode) {
            return $q.reject(respData);
          }

          respData.errorCode = 'undefined_error';
          if (400 === response.status) {
            respData.errorCode = 'wrong_credentials';

            if ('unconfirmed_tc' === respData.message) {
              respData.errorCode = respData.message;
            }
          }

          return $q.reject(respData);
        });
      },
      signinOAuth: function (providerId) {
        var self = this;
        return oauthIO.popup(providerId)
          .then(function (result) {
            return self.signin(undefined, undefined, undefined, {
              provider: providerId,
              accessToken: result['access_token']
            }).catch(function (errorData) {
              errorData.oauthResult = result;

              return $q.reject(errorData);
            });
          }, function () {
            return $q.reject({
              message: 'Ошибка OAuth провайдера ' + providerId
            });
          });
      },
      signout: function () {
        return $http.post(pdConfig.apiEndpoint + 'auth/signout')
          .finally(function () {
            ipCookie('pdsession', 'wrong_session', {domain: pdConfig.AUTH_COOKIE_DOMAIN});
            authStorage.clearAll();
            $rootScope.$broadcast('auth.signout');
          });
      },
      isAuthenticated: isAuthenticated,
      getAuthToken: function () {
        return authStorage.getApiAuthToken();
      },
      getRoles: getRoles,
      getPasswordBySMS: function (username, captchaData) {
        return $http.post(pdConfig.apiEndpoint + 'auth/get_password_by_sms', {
          phoneNumber: username,
          recaptchaData: captchaData
        }).catch(function (response) {
          var responseData = response.data;
          if (!_.has(responseData, 'status') || !_.has(responseData, 'message')) {
            responseData.message = 'Неизвестная ошибка. Обратитесь к администрации сайта';
          }

          return $q.reject(responseData);
        });
      },
      isCurrentHasClientRole: function () {
        return isContainsRole('ROLE_CLIENT');
      },
      isCurrentHasLoruRole: function () {
        return isContainsRole('ROLE_LORU');
      },
      isCurrentHasOmsRole: function () {
        return isContainsRole('ROLE_OMS');
      },
      isContainsRole: isContainsRole,
      getUserProfile: function () {
        return authStorage.getProfile().profile || {};
      },
      getUserOrganisation: function () {
        return authStorage.getProfile().organisation || {};
      },
      signup: function (signupModel) {
        return $http.post(pdConfig.apiEndpoint + 'auth/signup', signupModel)
          .then(function (response) {
            return applySuccessSigninResponse(response.data);
          });
      },
      organisationSignup: function (signupModel) {
        var deferred = $q.defer(),
          certificateFile = signupModel.certificatePhoto;

        delete signupModel.certificatePhoto;
        $upload.upload({
            url: pdConfig.apiEndpoint + 'org/signup',
            tracker: 'commonLoadingTracker',
            data: signupModel,
            file: certificateFile,
            fileFormDataName: 'certificatePhoto'
          })
          .then(function (response) {
            deferred.resolve(response.data);
          }, function (errorResponse) {
            deferred.reject(errorResponse.data);
          });

        return deferred.promise;
      }
    };
  })
  .service('authStorage', function (storage) {
    var API_AUTH_TOKEN = 'pd.auth.token',
      AUTH_ROLES_KEY = 'pd.auth.roles',
      AUTH_PROFILE_KEY = 'pd.auth.user.profile';

    return {
      setApiAuthToken: function (token) {
        storage.set(API_AUTH_TOKEN, token);

        return this;
      },
      getApiAuthToken: function () {
        return storage.get(API_AUTH_TOKEN);
      },
      isAvailableAuthToken: function () {
        return !!this.getApiAuthToken();
      },
      removeApiAuthToken: function () {
        storage.remove(API_AUTH_TOKEN);

        return this;
      },
      setRoles: function (roles) {
        storage.set(AUTH_ROLES_KEY, roles);

        return this;
      },
      getRoles: function () {
        return storage.get(AUTH_ROLES_KEY);
      },
      removeRoles: function () {
        storage.remove(AUTH_ROLES_KEY);

        return this;
      },
      setProfile: function (profileData) {
        storage.set(AUTH_PROFILE_KEY, profileData);

        return this;
      },
      getProfile: function () {
        return storage.get(AUTH_PROFILE_KEY) || {};
      },
      removeProfile: function () {
        storage.remove(AUTH_PROFILE_KEY);

        return this;
      },
      clearAll: function () {
        this.removeApiAuthToken();
        this.removeRoles();
        this.removeProfile();

        return this;
      }
    };
  })
  .factory('authApiInterceptor', function ($q, $location, pdConfig, authStorage) {
    var apiUrlRegexp = new RegExp('^' + pdConfig.apiEndpoint);

    return {
      request: function (config) {
        // If access forbidden response from api then redirect to signin page
        if (apiUrlRegexp.test(config.url) && authStorage.isAvailableAuthToken()) {
          config.headers.Authorization = 'Token ' + authStorage.getApiAuthToken();
        }

        return config;
      },
      responseError: function (rejection) {
        // If access forbidden response from api then redirect to signin page
        if (_.has(rejection.config, 'url') &&
          apiUrlRegexp.test(rejection.config.url) &&
          403 === rejection.status &&
          true !== rejection.config.notHandle403
        ) {
          authStorage.clearAll();
          $location.path('/');
        }

        return $q.reject(rejection);
      }
    };
  })
;
