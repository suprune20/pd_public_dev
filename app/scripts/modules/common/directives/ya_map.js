'use strict';

angular.module('pdCommon')
  .directive('pdYaSearchToolbar', function (templateLayoutFactory) {
    return {
      require: '^yaMap',
      restrict: 'E',
      templateUrl: 'views/modules/common/directives/ya_map/pd_ya_search_toolbar.html',
      scope: {
        options: '@yaOptions'
      },
      controller: function ($scope) {
        $scope.searchOver = {
          build: function () {
            var MySearchControlLayout = templateLayoutFactory.get('pdSearchTemplate');
            MySearchControlLayout.superclass.build.call(this);
            var formElement = MySearchControlLayout.superclass.getParentElement.call(this);

            this.onSubmit = ymaps.util.bind(this.onSubmit, this);
            this.onFieldChange = ymaps.util.bind(this.onFieldChange, this);
            this.dataSource = ymaps.util.bind(this.dataSource, this);

            this.form = angular.element(formElement.getElementsByClassName('form-search'))
              .on('submit', this.onSubmit);
            this.searchBtn = this.form.find('.search-btn')
              .on('click', this.onSubmit);
            this.field = angular.element(formElement.getElementsByClassName('search-query'))
              .on('change', this.onFieldChange)
              .typeahead({source: this.dataSource, items: 5, minLength: 3});

            this.getData().state.events.add('change', this.onStateChange, this);
          },
          clear: function () {
            this.getData().state.events.remove('change', this.onStateChange, this);
            this.field.off('**');
            this.form.off('submit', this.onSubmit);
            this.searchBtn.off('click', this.onSubmit);

            var MySearchControlLayout = templateLayoutFactory.get('pdSearchTemplate');
            MySearchControlLayout.superclass.clear.call(this);
          },
          onFieldChange: function () {
            if(this.field.is(':focus')) {
              this.form.trigger('submit');
            }
          },
          dataSource: function (query, callback) {
            var provider = this.getData().control.options.get('provider');

            ymaps.geocode(query, {provider: provider})
              .then(function (res) {
                var results = [];

                res.geoObjects.each(function (geoObject) {
                  var props = geoObject.properties,
                    text = props.get('text'),
                    name = props.get('name'),
                    description = props.get('description'),
                    tags = $.map(props.get('metaDataProperty.PSearchObjectMetaData') &&
                      props.get('metaDataProperty.PSearchObjectMetaData.Tags') || [], function (t) { return t.tag; });

                  results.push(
                      text || [name, description]
                      .concat(tags)
                      .filter(Boolean)
                      .join(', ')
                  );
                });
                callback(results);
              });
          },
          onSubmit: function (e) {
            e.preventDefault();

            this.events.fire('search', {
              request: this.field.val()
            });
          },
          onStateChange: function () {
            var results = this.getData().state.get('results'),
              result = results && results[0];

            if (result) {
              result.options.set('preset', 'twirl#darkblueStretchyIcon');
              result.options.set('openBalloonOnClick', false);
              result.properties.set('iconContent', result.properties.get('name'));
              result.events.add('click', function () {
                result.events.remove('click');
                result.options.set('visible', false);
              });
            }
          }
        };
      }
    };
  })
  .directive('pdYaMapSizer', function ($window, $timeout) {
    return {
      restrict: 'E',
      require: '^yaMap',
      link: function (scope, element, attrs, yaMapCtrl) {
        var mapContEl = yaMapCtrl.getMap().container.getElement();

        attrs.$observe('pdYaSize', function (size) {
          mapContEl.style.width = '100%';
          if ('23PartHeight' === size) {
            mapContEl.style.height = ($window.innerHeight * 2 / 3 - parseInt(attrs.pdYaHeightDecrease, 10) || 0) + 'px';
          } else if ('full' === size) {
            mapContEl.style.height = ($window.innerHeight - parseInt(attrs.pdYaHeightDecrease, 10) || 0) + 'px';
          }

          $timeout(function () {
            yaMapCtrl.getMap().container.fitToViewport();
          }, 50);
        });
      }
    };
  })
;