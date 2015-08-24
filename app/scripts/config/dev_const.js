'use strict';

angular.module('pdConfig')
  .constant('appEnv', 'staging')
  .constant('ravenDevelopment', true)
  .value('serverConfig', {
    serverHost: 'https://org.dev.pohoronnoedelo.ru/',
    cookieDomain: '.dev.pohoronnoedelo.ru'
  })
;
