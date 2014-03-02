'use strict';

angular.module('pdCommon')
  .filter('space2br', function () {
    return function (value) {
      if (value) {
        value = value.replace(/\s/g, '<br/>');
      }

      return value;
    };
  })
;
