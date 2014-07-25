'use strict';

angular.module('pdCommon')
  .filter('money2iso', function () {
    return function (value) {
      switch (value) {
        case 'RUR':
          value = 'RUB';
      }

      return value;
    };
  })
;
