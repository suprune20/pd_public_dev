'use strict';

angular.module('pdConfig')
  .constant('appEnv', 'dev')
  .constant('ravenDevelopment', true)
  .constant('serverConfig', {
    serverHost: 'https://org.dev.pohoronnoedelo.ru/',
    cookieDomain: '.pohoronnoedelo.ru'
  })
;
