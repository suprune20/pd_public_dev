// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/lodash/dist/lodash.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/nginfinitescroll/build/ng-infinite-scroll.js',
      'app/bower_components/angular-yandex-map/example/ya-map.js',
      'app/bower_components/select2/select2.js',
      'app/bower_components/angular-ui-select2/src/select2.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-cookie/angular-cookie.js',
      'app/bower_components/angularLocalStorage/src/angularLocalStorage.js',
      'app/bower_components/angular-promise-tracker/promise-tracker.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-growl/build/angular-growl.js',
      'app/bower_components/ng-file-upload/angular-file-upload.js',
      'app/bower_components/checklist-model/checklist-model.js',
      'app/bower_components/angular-strap/dist/modules/date-parser.js',
      'app/bower_components/angular-strap/dist/modules/dimensions.js',
      'app/bower_components/angular-strap/dist/modules/tooltip.js',
      'app/bower_components/angular-strap/dist/modules/tooltip.tpl.js',
      'app/bower_components/angular-strap/dist/modules/datepicker.js',
      'app/bower_components/angular-strap/dist/modules/datepicker.tpl.js',
      'app/bower_components/oauth-js/dist/oauth.js',
      'app/bower_components/angular-bindonce/bindonce.js',
      'app/bower_components/angular-xeditable/dist/js/xeditable.js',
      'app/scripts/modules/admin/module.js',
      'app/scripts/modules/frontend/module.js',
      'app/scripts/modules/loru/module.js',
      'app/scripts/modules/oms/module.js',
      'app/scripts/modules/common/module.js',
      '.tmp/scripts/*.js',
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js',
      'app/views/**/*.html'
    ],

    preprocessors: {
      'app/views/**/*.html': 'ng-html2js'
    },
    ngHtml2JsPreprocessor: {
      stripPrefix: 'app/'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
