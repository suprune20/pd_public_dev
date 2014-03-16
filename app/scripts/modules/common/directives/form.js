'use strict';

angular.module('pdCommon')
  .directive('fixAutofill', function ($interval) {
    return function (scope, iElement, iAttrs) {
      var intervalPromise;

      iAttrs.$observe('fixAutofill', function (needFix) {
        if (true === scope.$eval(needFix)) {
          intervalPromise = $interval(function () {
            iElement.find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
          }, 500);
        } else if (intervalPromise) {
          // Clear intervals between needFix callbacks callbacks
          $interval.cancel(intervalPromise);
        }
      });
      scope.$on('$destroy', function () {
        $interval.cancel(intervalPromise);
      });
    };
  })
  .directive('pdFileSelector', function (fileReader) {
    return {
      restrict: 'E',
      require: 'ngModel',
      templateUrl: 'views/modules/common/directives/pd_file_selector.html',
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }

        var updateModelViewValue = function (value) {
          ngModel.$setViewValue(value);
          ngModel.$render();
        };

        ngModel.$render = function () {
          var modelValue = ngModel.$viewValue;

          scope.isEmptyModel = !modelValue;

          if (_.has(attrs, 'pdAllowPreview')) {
            var imagePreviewCont = element.find('.pd-file-selector-preview'),
              addPreviewImage = function (imageSrc) {
                imagePreviewCont.html(angular.element('<img src="' + imageSrc + '" />'));
              },
              clearPreview = function () {
                imagePreviewCont.html('');
              };

            if (modelValue instanceof File && /image\//.test(modelValue.type)) {
              fileReader.readAsDataURL(modelValue, scope)
                .then(function (imageData) {
                  addPreviewImage(imageData);
                });
            } else if (/https?:\/\//.test(modelValue)) {
              addPreviewImage(modelValue);
            } else {
              clearPreview();
            }
          }
        };

        element.find('[type=file]').on('change', function (event) {
          scope.$apply(function () {
            if (!event.target.files.length) {
              return;
            }

            updateModelViewValue(event.target.files[0]);
          });
        });

        scope.clearSelection = function () {
          updateModelViewValue(null);
        };
      }
    };
  })
  .directive('passwordRepeat', function () {
    return {
      require: 'ngModel',
      link: function (scope, iElement, iAttrs, modelCtrl) {
        var otherInput = iElement.inheritedData('$formController')[iAttrs.passwordRepeat];

        modelCtrl.$parsers.push(function (value) {
          if (value === otherInput.$viewValue) {
            modelCtrl.$setValidity('passwordRepeat', true);

            return value;
          }

          modelCtrl.$setValidity('passwordRepeat', false);
        });

        otherInput.$parsers.push(function (value) {
          modelCtrl.$setValidity('passwordRepeat', value === modelCtrl.$viewValue);

          return value;
        });
      }
    };
  })
;
