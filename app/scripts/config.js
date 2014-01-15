'use strict';

(function (angular) {
  var serverHost = 'http://pd2cat.bsuir.by/';

  angular.module('pdApp')
    .constant('apiEndpoint', serverHost + 'api/')
    .constant('imageThumbnailerConfig', {
      baseUrl: serverHost + 'media',
      thumbnailBaseUrl: serverHost + 'thumb'
    })
  ;
})(angular);
