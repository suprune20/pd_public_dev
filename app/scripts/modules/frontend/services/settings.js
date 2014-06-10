'use strict';

/* jshint -W069 */

angular.module('pdFrontend')
  .service('settingsProvider', function (user, oauthIO, $q) {
    return user.getSettings().then(function (settingsData) {
      settingsData.attachOAuthProvider = function (provider) {
        return oauthIO.popup(provider)
          .then(function (result) {
            return user.addOAuthProvider(provider, result['access_token'])
              .then(function (attachedProviderData) {
                settingsData.oauthProviders[provider] = {
                  id: provider,
                  username: attachedProviderData.username
                };

                return attachedProviderData;
              });
          }, function () {
            return $q.reject({
              message: 'Ошибка работы с OAuth сервиса ' + provider
            });
          });
      };
      settingsData.detachOAuthProvider = function (providerId) {
        return user.removeOAuthProvider(providerId)
          .then(function () {
            delete settingsData.oauthProviders[providerId];
          });
      };

      return settingsData;
    });
  })
;
