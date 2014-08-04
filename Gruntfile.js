'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  var util = require('util');

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/scripts/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/**/*.js'],
        tasks: ['newer:jshint:test', 'karma:unit']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/**/*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/views/**/*.html',
          '<%= yeoman.app %>/index.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729,
        middleware: function (connect, options) {
          var optBase = (typeof options.base === 'string') ? [options.base] : options.base;

          return [require('connect-modrewrite')(['!(\\..+)$ / [L]'])]
            .concat(optBase.map(function (path) {
              if (path.indexOf('rewrite|') === -1) {
                return connect.static(path);
              } else {
                path = path.replace(/\\/g, '/').split('|');
                return  connect().use(path[1], connect.static(path[2]));
              }
            }));
        }
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            'rewrite|/bower_components|./bower_components',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/**/*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      },
      'ci_src': {
        options: {
          reporter: 'checkstyle',
          reporterOutput: 'build/jshint_src.xml',
          force: true
        },
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/**/*.js'
        ]
      },
      'ci_tests': {
        options: {
          reporter: 'checkstyle',
          reporterOutput: 'build/jshint_tests.xml',
          jshintrc: 'test/.jshintrc',
          force: true
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    bowerInstall: {
      app: {
        src: '<%= yeoman.app %>/index.html',
        ignorePath: '<%= yeoman.app %>/',
        exclude: [
          'bower_components/respond/dest/respond.src.js',
          'bower_components/ng-file-upload/angular-file-upload-shim.js',
          'bower_components/jquery/dist/jquery.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/angular-sanitize/angular-sanitize.js',
          'bower_components/angular-animate/angular-animate.js',
          // Use custom modules instead of full lib
          'bower_components/angular-strap/dist/angular-strap.min.js',
          'bower_components/angular-strap/dist/angular-strap.tpl.min.js',
          'bower_components/bootstrap/dist/css/bootstrap.css'
        ]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n',
        specify: '<%= yeoman.app %>/styles/main.scss'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*',
            // Exclude any images
            '!<%= yeoman.dist %>/images/blueCircleDotIcon.png', // Yandex map custom marker
            '!<%= yeoman.dist %>/images/redCircleDotIcon.png' // Yandex map custom marker
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: [
            '*.html'
//            'views/{,*/}*.html'
          ],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      options: {
        cdn: require('google-cdn-data')
      },
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
//            'views/**/*.html',
            'bower_components/**/*',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      seo: {
        files: [{
          src: '<%= yeoman.dist %>/index.html',
          dest: '<%= yeoman.dist %>/index_seo.html'
        }]
      },
      configDev: {files:[{src:'<%= yeoman.app %>/scripts/config/dev_const.js', dest:'.tmp/scripts/config_const.js'}]},
      configPd3: {files:[{src:'<%= yeoman.app %>/scripts/config/pd3_const.js', dest:'.tmp/scripts/config_const.js'}]},
      configProd: {files:[{src:'<%= yeoman.app %>/scripts/config/prod_const.js', dest:'.tmp/scripts/config_const.js'}]}
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server',
        'html2js'
      ],
      test: [
        'compass',
        'html2js'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin',
        'html2js'
      ]
    },

    /**
    * Concatenate all angular templates into one js file ($templateCache)
    *
    * Add grunt-angular-templates node module into package.json
    * !!Note: not working with rev images now
    */
    ngtemplates: {
      app: {
        cwd: '<%= yeoman.app %>',
        src: 'views/**/*.html',
        dest: '.tmp/templates.js',
        options: {
          htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true },
          usemin: 'scripts/scripts.js',
          module: 'pdApp'
        }
      }
    },

    html2js: {
      options: {
        base: '.'
      }
//      uiBootstrap: {
//        options: {
//          module: 'ui.bootstrap.templates',
//          rename: function (modulePath) {
//            var moduleName = modulePath.replace('app/bower_components/ui.bootstrap/template/', '').replace('.html', '');
//
//            return 'template' + '/' + moduleName + '.html';
//          }
//        },
//        src: [
//          'app/bower_components/ui.bootstrap/template/modal/*.html',
//          'app/bower_components/ui.bootstrap/template/carousel/*.html'
//        ],
//        dest: '.tmp/scripts/ui.bootstrap.templates.js'
//      }
    },

    concat: {
      options: {
        process: function (content, filepath) {
          // Replace path to images in vendors css files
          var cssFileMatched = /^app\/bower_components(\/.*\/).*\.css$/.exec(filepath);

          if (cssFileMatched) {
            return content.replace(/url(?:\s+)?\(([^\)]+)\)/igm, function (match, url) {
              url = url.replace(/'|"/g, '');

              if (/^\//.test(url)) {
                grunt.log.writeln(' - Absolute urls are not supported, url ignored => ' + url);
                return url;
              }

              if (/^(\s+)?$/.test(url)) {
                grunt.log.writeln(' - Empty urls are not supported, url ignored => ' + url);
                return url;
              }

              if (/#/.test(url) && !/\?#iefix|svg#/.test(url)) {
                grunt.log.writeln(' - Anchors not allowed, url ignored => ' + url);
                return url;
              }

              var newUrl = util.format('/bower_components%s%s', cssFileMatched[1], url);
              grunt.log.writeln(util.format('* (%s): %s -> %s', cssFileMatched[0], match, newUrl));

              return util.format('url(%s)', newUrl);
            });
          }

          return content;
        }
      }
    },

    processhtml: {
      prod: {files: {'<%= yeoman.dist %>/index.html': '<%= yeoman.dist %>/index.html'}},
      dev: {files: {'<%= yeoman.dist %>/index.html': '<%= yeoman.dist %>/index.html'}},
      pd3: {files: {'<%= yeoman.dist %>/index.html': '<%= yeoman.dist %>/index.html'}}
    },

//    uglify: {
//      options: {
//        mangle: false
//      }
//    },

    robotstxt: {
      prod: {
        dest: '<%= yeoman.dist %>',
        policy: [
          {
            ua: '*',
            disallow: [
              '/signout',
              '/loru/',
              '/register',
              '*_escaped_fragment_=/'
            ]
          }
        ]
      },
      dev: {
        dest: '<%= yeoman.dist %>',
        policy: [{
          ua: '*',
          disallow: '/'
        }]
      }
    },

    'dom_munger': {
      seo: {
        options: {
          remove: 'meta[name=fragment]',
          append: [
            {
              selector: 'body',
              html: '<script>angular.module("pdApp").config(function ($locationProvider) {$locationProvider.html5Mode(false);})</script>'
            }
          ]
        },
        src: '<%= yeoman.dist %>/index_seo.html'
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      'unit_ci': {
        configFile: 'karma.conf.js',
        singleRun: true,
        reporters: ['dots', 'junit'],
        junitReporter: {
          outputFile: 'build/karma.xml'
        }
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bowerInstall',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('prepare_test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test'
  ]);

  grunt.registerTask('test', [
    'prepare_test',
    'karma:unit'
  ]);

  grunt.registerTask('ci:jshint', [
    'jshint:ci_src',
    'jshint:ci_tests'
  ]);

  grunt.registerTask('ci', [
    'ci:jshint',
    'prepare_test',
    'karma:unit_ci'
  ]);

  grunt.registerTask('build', function (target) {
    if (-1 === ['pd3', 'dev', 'prod'].indexOf(target)) {
      target = 'pd3';
    }

    var tasksList = [
      'clean:dist',
      'bowerInstall',
      'useminPrepare',
      'copy:config' + target.charAt(0).toUpperCase() + target.slice(1),
      'concurrent:dist',
      'autoprefixer',
      'ngtemplates',
      'concat',
      'ngAnnotate',
      'copy:dist',
      'cdnify',
      'processhtml:' + target,
      'cssmin',
      'uglify',
      'rev',
      'usemin',
      'htmlmin',
      'robotstxt:' + ('prod' === target ? 'prod' : 'dev')
    ];
    if ('prod' === target) {
      tasksList.push('copy:seo');
      tasksList.push('dom_munger:seo');
    }

    grunt.task.run(tasksList);
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
