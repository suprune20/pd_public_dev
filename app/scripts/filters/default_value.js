'use strict';

angular.module('pdApp')
  .filter('default', function () {
    return function (inputVal, defaultVal) {
      if (inputVal !== null && typeof inputVal !== 'undefined' && inputVal !== '') {
        return inputVal;
      }

      return defaultVal || '';
    };
  })
;
