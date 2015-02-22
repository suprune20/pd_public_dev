'use strict';

angular.module('pdCommon')
  .directive('flexSlider', function() {
    return {
      restrict: 'AE',
      scope: false,
      replace: true,
      transclude: true,
      template: '<div class="flexslider-container"></div>',
      compile: function(element, attr, linker) {
        return function($scope, $element, $attr) {
          var collectionString, elementsScopes, flexsliderDiv, indexString, match;

          match = $attr.slides.match(/^\s*(.+)\s+in\s+(.*?)\s*$/);
          indexString = match[1];
          collectionString = match[2];
          elementsScopes = [];
          flexsliderDiv = null;
          return $scope.$watch(collectionString, function(collection) {
            var attrKey, attrVal, c, childScope, e, n, slides, _i, _j, _len, _len1;

            if (elementsScopes.length > 0 || (flexsliderDiv !== null)) {
              $element.children().remove();
              for (_i = 0, _len = elementsScopes.length; _i < _len; _i++) {
                e = elementsScopes[_i];
                e.$destroy();
              }
              elementsScopes = [];
            }
            slides = $('<ul class="slides"></ul>');
            flexsliderDiv = $('<div class="flexslider"></div>');
            flexsliderDiv.append(slides);
            $element.append(flexsliderDiv);
            if (collection === null) {
              return;
            }
            for (_j = 0, _len1 = collection.length; _j < _len1; _j++) {
              c = collection[_j];
              childScope = $scope.$new();
              childScope[indexString] = c;
              linker(childScope, function(clone) {
                slides.append(clone);
                return elementsScopes.push(childScope);
              });
            }
            for (attrKey in $attr) {
              attrVal = $attr[attrKey];
              if (attrKey.indexOf('$') === 0) {
                continue;
              }
              if (!isNaN(n = parseInt(attrVal))) {
                $attr[attrKey] = n;
                continue;
              }
              if (attrVal === 'false' || attrVal === 'true') {
                $attr[attrKey] = attrVal === 'true';
                continue;
              }
              if (attrKey === 'start' || attrKey === 'before' || attrKey === 'after' || attrKey === 'end' || attrKey === 'added' || attrKey === 'removed') {
                $attr[attrKey] = (function(evalExp) {
                  return function() {
                    return $scope.$apply(function() {
                      return $scope.$eval(evalExp);
                    });
                  };
                })(attrVal);
                continue;
              }
            }
            return setTimeout((function() {
              return $scope.$apply(function() {
                return flexsliderDiv.flexslider($attr);
              });
            }), 0);
          });
        };
      }
    };
  }
);