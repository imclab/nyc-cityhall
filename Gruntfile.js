'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({

    root: {
      app: 'public/app',
      dist: 'public/dist',
      tmp: 'public/.tmp'
    },

    watch: {
      js: {
        files: [
          '<%= root.app %>/scripts/{,*/}{,*/}*.js',
          'Gruntfile.js'
        ],
        tasks: ['jshint']
      },
      compass: {
        files: ['<%= root.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server']
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= root.tmp %>',
            '<%= root.dist %>/*',
            '!<%= root.dist %>/.git*'
          ]
        }]
      },
      server: '<%= root.tmp %>'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= root.app %>/scripts/{,*/}{,*/}*.js'
      ]
    },

    requirejs: {
      options: {
        optimize: 'uglify',
        preserveLicenseComments: false,
        useStrict: true,
        wrap: false
      },
      dist: {
        options: {
          baseUrl: './',
          include: '<%= root.app %>/scripts/main',
          out: '<%= root.dist %>/scripts/main.js',
          mainConfigFile: '<%= root.app %>/scripts/main.js',
        }
      }
    },

    compass: {
      options: {
        sassDir: '<%= root.app %>/styles',
        cssDir: '<%= root.tmp %>/styles',
        generatedImagesDir: '<%= root.tmp %>/images/generated',
        imagesDir: '<%= root.app %>/images',
        javascriptsDir: '<%= root.app %>/scripts',
        fontsDir: '<%= root.app %>/styles/fonts',
        importPath: '<%= root.app %>/vendor',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false
      },
      dist: {
        options: {
          generatedImagesDir: '<%= root.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          '<%= root.dist %>/vendor/requirejs/require.js': ['<%= root.app %>/vendor/requirejs/require.js']
        }
      }
    },

    bower: {
      all: {
        rjsConfig: '<%= root.app %>/scripts/main.js'
      }
    },

    rev: {
      dist: {
        files: {
          src: [
            '<%= root.dist %>/scripts/{,*/}*.js',
            '<%= root.dist %>/styles/{,*/}*.css',
            '<%= root.dist %>/images/{,*/}*.{gif,jpeg,jpg,png,webp}',
            '<%= root.dist %>/styles/fonts/{,*/}*.*'
          ]
        }
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= root.dist %>'
      },
      html: '<%= root %>/index.html'
    },

    usemin: {
      options: {
        assetsDirs: ['<%= root.dist %>']
      },
      html: ['<%= root.dist %>/{,*/}*.html'],
      css: ['<%= root.dist %>/styles/{,*/}*.css']
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= root.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= root.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          // collapseBooleanAttributes: true,
          // collapseWhitespace: true,
          // removeAttributeQuotes: true,
          // removeCommentsFromCDATA: true,
          // removeEmptyAttributes: true,
          // removeOptionalTags: true,
          // removeRedundantAttributes: true,
          // useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= root.dist %>',
          src: '{,*/}*.html',
          dest: '<%= root.dist %>'
        }]
      }
    },

    cssmin: {
      dist: {
        files: {
          '<%= root.dist %>/styles/main.css': [
            '<%= root.tmp %>/styles/{,*/}*.css',
            '<%= root.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= root.app %>',
          dest: '<%= root.dist %>',
          src: [
            '*.{ico,png,txt}',
            '{,*/}*.html'
          ]
        }]
      }
    }

  });

  grunt.registerTask('build', [
    'clean:dist',
    'requirejs',
    'useminPrepare',
    'copy:dist',
    'uglify',
    'compass:dist',
    'cssmin',
    'imagemin',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'clean:server',
    'jshint',
    'compass:server'
  ]);
};
