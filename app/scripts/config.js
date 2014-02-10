'use strict';

(function (angular) {
  var serverHost = 'http://pd2cat.pohoronnoedelo.ru/';

  angular.module('pdConfig', [])
    .constant('pdConfig', {
      apiEndpoint: serverHost + 'api/',
      backendUrl: serverHost,
      AUTH_TOKEN_KEY: 'pd.auth.token',
      AUTH_ROLES_KEY: 'pd.auth.roles',
      AUTH_COOKIE_DOMAIN: '.pohoronnoedelo.ru',
      imageThumbnailerConfig: {
        baseUrl: serverHost + 'media',
        thumbnailBaseUrl: serverHost + 'thumb'
      },
      menuConfigs: {
        cabinetMenu: {
          items:[
            {link: '#/client-panel', title: 'Кабинет ответственного'},
            {link: '#/catalog', title: 'Каталог'}
          ]
        },
        adminMenu: {
          navbarClasses: 'navbar-inverse',
          items: [
            {link: serverHost, title: 'Django панель'}
          ]
        },
        loruMenu: {
          navbarClasses: 'navbar-inverse',
          items: [
            {link: serverHost, title: 'Django панель'},
            {link: '#/loru/advertisement', title: 'Реклама'}
          ]
        }
      }
    })
    // Deprecated single constants, move into psConfig
    .constant('apiEndpoint', serverHost + 'api/')
    .constant('imageThumbnailerConfig', {
      baseUrl: serverHost + 'media',
      thumbnailBaseUrl: serverHost + 'thumb'
    })
  ;
})(angular);
