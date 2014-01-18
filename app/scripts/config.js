'use strict';

(function (angular) {
  var serverHost = 'http://pd2cat.bsuir.by/';

  angular.module('pdApp')
    .constant('pdConfig', {
      apiEndpoint: serverHost + 'api/',
      imageThumbnailerConfig: {
        baseUrl: serverHost + 'media',
        thumbnailBaseUrl: serverHost + 'thumb'
      },
      mainMenu: [
        {link: '/', title: 'Главная'},
        {link: '/catalog', title: 'Каталог'},
        {link: '/client-panel', title: 'Панель пользователя'},
        {link: '/about-us', title: 'О нас'},
        {link: '/contacts', title: 'Контакты'}
      ]
    })
    // Deprecated single constants, move into psConfig
    .constant('apiEndpoint', serverHost + 'api/')
    .constant('imageThumbnailerConfig', {
      baseUrl: serverHost + 'media',
      thumbnailBaseUrl: serverHost + 'thumb'
    })
  ;
})(angular);
