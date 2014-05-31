'use strict';

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
        $window.OAuth.initialize(provider.publicKey);
        if (provider.oauthdURL) {
          $window.OAuth.setOAuthdURL(provider.oauthdURL);
        }

        this.popup = function (service) {
          var deferred = $q.defer();
          $window.OAuth.popup(service)
            .done(function (result) {
              result.me = function () {
                var meDeferred = $q.defer();
                result.get('/me')
                  .done(function (result) { meDeferred.resolve(result); })
                  .fail(function (error) { meDeferred.reject(error); });

                return meDeferred.promise;
              };

              deferred.resolve(result);
            })
            .fail(function (error) { deferred.reject(error); });

          return deferred.promise;
        };
      }

      return new OAuth();
    };
  })
;
