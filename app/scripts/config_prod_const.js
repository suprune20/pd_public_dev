'use strict';

angular.module('pdConfig')
  .constant('env', 'prod')
  .constant('ravenDevelopment', false)
  .value('serverConfig', {
    serverHost: 'https://org.pohoronnoedelo.ru/',
    cookieDomain: '.pohoronnoedelo.ru'
  })
;
