'use strict';

angular.module('pdConfig')
  .constant('appEnv', 'prod')
  .constant('ravenDevelopment', false)
  .value('serverConfig', {
    serverHost: 'https://org.pohoronnoedelo.ru/',
    cookieDomain: '.pohoronnoedelo.ru'
  })
;
