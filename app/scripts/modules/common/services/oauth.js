'use strict';

/* jshint -W069 */

angular.module('pdCommon')
  .provider('oauthIO', function () {
    this.publicKey = '';
    this.oauthdURL = '';

    this.setPublicKey = function (key) {
      this.publicKey = key;
    };
    this.setOAuthdURL = function (url) {
      this.oauthdURL = url;
    };
    this.$get = function ($window, $q) {
      var provider = this;

      function OAuth() {
        // Mapping for getting current user profile for different providers
        var MyProfile = function (firstName, lastName, email, phone) {
            return _.defaults({
              firstName: firstName,
              lastName: lastName,
              email: email,
              phone: phone
            }, {
              firstName: null,
              lastName: null,
              email: null,
              phone: null
            });
          },
          providerMyProfile = {
            facebook: function (result) {
              var deferred = $q.defer();
              result.get('/me')
                .done(function (result) {
                  deferred.resolve(new MyProfile(result['first_name'], result['last_name'], result.email));
                })
                .fail(deferred.reject);

              return deferred.promise;
            },
            vk: function (result) {
              var deferred = $q.defer();
              result.get('/method/getProfiles?fields=first_name,last_name,email,phone')
                .done(function (result) {
                  result = result.response[0];
                  deferred.resolve(new MyProfile(result['first_name'], result['last_name']));
                })
                .fail(deferred.reject);

              return deferred.promise;
            },
            google: function (result) {
              var deferred = $q.defer();
              result.get('/plus/v1/people/me')
                .done(function (result) {
                  deferred.resolve(
                    new MyProfile(result.name.givenName, result.name.familyName, result.emails[0].value)
                  );
                })
                .fail(deferred.reject);

              return deferred.promise;
            },
            yandex: function (result) {
              var deferred = $q.defer();
              result.get('https://login.yandex.ru/info')
                .done(function (result) {
                  deferred.resolve(
                    new MyProfile(result['first_name'], result['last_name'], result['default_email'])
                  );
                })
                .fail(deferred.reject);

              return deferred.promise;
            },
            odnoklassniki: function () { return $q.when(new MyProfile()); }
          };

        $window.OAuth.initialize(provider.publicKey);
        if (provider.oauthdURL) {
          $window.OAuth.setOAuthdURL(provider.oauthdURL);
        }

        this.popup = function (service) {
          var deferred = $q.defer();
          $window.OAuth.popup(service)
            .done(function (result) {
              result.accessToken = result['access_token'];
              result.me = function () { return providerMyProfile[service](result); };

              deferred.resolve(result);
            })
            .fail(deferred.reject);

          return deferred.promise;
        };

      }

      return new OAuth();
    };
  })
;
