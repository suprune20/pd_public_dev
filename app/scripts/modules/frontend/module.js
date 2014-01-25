'use strict';

angular.module('pdFrontend', [
    'ngRoute',
    'pdCommon',
    'ui.select2',
    'infinite-scroll',
    'yaMap'
  ])
  .run(function () {
    console.log('pdFrontend loaded');
  })
;
