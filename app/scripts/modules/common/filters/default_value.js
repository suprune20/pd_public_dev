'use strict';

angular.module('pdCommon')
  .filter('default', function () {
    return function (inputVal, defaultVal) {
      if (inputVal !== null && typeof inputVal !== 'undefined' && inputVal !== '') {
        return inputVal;
      }

      return defaultVal || '';
    };
  })
;
