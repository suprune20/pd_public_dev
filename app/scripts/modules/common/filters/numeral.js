'use strict';

angular.module('pdCommon')
  .filter('numeralFormat', function ($window) {
    return function (value, format) {
      return $window.numeral(value).format(format);
    };
  })
;
