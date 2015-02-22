'use strict';

angular.module('pdCommon')
  .directive('touchspin', function () {
    return {
      template: '<input type="text" name="spin" class="form-control spinner-input">',
      require: 'ngModel',
      restrict: 'E',
      link: function (scope, element, attrs, ngModelCtrl) {
        var min = parseInt(attrs.min || 0, 10),
          max = parseInt(attrs.max || 999),
          step = parseInt(attrs.step || 1),
          $input = element.find('input'),
          touchspinInput;

        scope.$watch(function () {
          return ngModelCtrl.$modelValue;
        }, function (value) {
          $input.val(value);
          touchspinInput.trigger('touchspin.updatesettings');
        });

        touchspinInput = $input.TouchSpin({
          min: min,
          max: max,
          stepinterval: step,
          initval: ngModelCtrl.$modelValue,
          forcestepdivisibility : 'none',
          booster : false
        });
        touchspinInput.on('change', function () {
          ngModelCtrl.$setViewValue(parseInt(touchspinInput.val(), 10));
        });
      }
    };
  })
;
