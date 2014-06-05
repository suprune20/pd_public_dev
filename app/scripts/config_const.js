'use strict';

angular.module('pdConfig')
  .constant('appEnv', 'dev')
  .constant('ravenDevelopment', true)
  .constant('serverConfig', {
    serverHost: 'https://pd2cat.pohoronnoedelo.ru/',
    cookieDomain: '.pohoronnoedelo.ru'
  })
;
