/* global module, require */

module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        meta: {
            srcFiles: [
                'src/**/*'
            ],
            srcJsFiles: [
                'src/assets/js/**/*.js'
            ],
            testJsFiles: [
                'test/**/*.js'
            ],
            ourJsFiles: [
                'Gruntfile.js',
                '<%= meta.srcJsFiles %>',
                '<%= meta.testJsFiles %>'
            ],
            developmentVendorJsFiles: [
                'assets/js/d3.js',
                'assets/js/css-layout.js',
                'assets/js/d3-legend.js',
                'assets/js/svg-innerhtml.js',
                'assets/js/d3fc.js',
                'assets/js/jquery.js',
                'assets/js/seedrandom.js',
                'assets/js/bootstrap.js'
            ],
            vendorJsFiles: [
                'node_modules/d3/d3.min.js',
                'node_modules/d3fc/node_modules/css-layout/dist/css-layout.min.js',
                'node_modules/d3fc/node_modules/d3-svg-legend/d3-legend.min.js',
                'node_modules/d3fc/node_modules/svg-innerhtml/svg-innerhtml.js',
                'node_modules/d3fc/dist/d3fc.min.js',
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/seedrandom/seedrandom.min.js',
                'node_modules/bootstrap/dist/js/bootstrap.min.js'
            ],
            coverageDir: 'coverage'
        },

        watch: {
            options: {
                atBegin: true,
                livereload: true
            },
            dev: {
                files: ['<%= meta.srcFiles %>'],
                tasks: ['build:development']
            },
            devTest: {
                files: ['<%= meta.ourJsFiles %>'],
                tasks: ['build:development', 'karma:chromeBackground:run']
            }
        },

        clean: {
            web: {
                src: ['dist']
            },
            mobile: {
                src: ['mobile/www']
            },
            sprite: {
                src: ['sprite']
            }
        },

        copy: {
            js: {
                files: [{
                    cwd: 'node_modules/d3/',
                    src: ['d3.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/d3fc/node_modules/css-layout/dist/',
                    src: ['css-layout.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/d3fc/node_modules/d3-svg-legend/',
                    src: ['d3-legend.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/d3fc/node_modules/svg-innerhtml/',
                    src: ['svg-innerhtml.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/d3fc/dist/',
                    src: ['d3fc.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/bootstrap/dist/js/',
                    src: ['bootstrap.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/jquery/dist',
                    src: ['jquery.js'],
                    dest: 'dist/assets/js',
                    expand: true
                },
                {
                    cwd: 'node_modules/seedrandom',
                    src: ['seedrandom.js'],
                    dest: 'dist/assets/js',
                    expand: true
                }
                ]
            },
            icons: {
                files: [{
                    cwd: 'sprite',
                    src: ['**/*.svg'],
                    dest: 'dist/assets/css',
                    expand: true
                }]
            },
            fonts: {
                files: [{
                    cwd: 'node_modules/bootstrap/dist/fonts/',
                    src: ['**'],
                    dest: 'dist/assets/fonts',
                    expand: true
                }]
            },
            mobile: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: 'mobile/www/'
                }]
            }
        },

        connect: {
            dist: {
                options: {
                    useAvailablePort: true,
                    base: 'dist',
                    keepalive: true
                }
            },
            watch: {
                options: {
                    useAvailablePort: true,
                    base: 'dist',
                    keepalive: false
                }
            }
        },

        'gh-pages': {
            origin: {
                options: {
                    base: 'dist',
                    message: 'Deploy to GitHub Pages'
                },
                src: ['**/*']
            },
            upstream: {
                options: {
                    base: 'dist',
                    message: 'Deploy to GitHub Pages',
                    repo: 'https://github.com/ScottLogic/BitFlux.git'
                },
                src: ['**/*']
            }
        },

        cordovacli: {
            options: {
                path: 'mobile',
                cli: 'cordova'
            },
            addIos: {
                options: {
                    command: 'platform',
                    action: 'add',
                    platforms: ['ios']
                }
            },
            addAndroid: {
                options: {
                    command: 'platform',
                    action: 'add',
                    platforms: ['android']
                }
            },
            prepareIos: {
                options: {
                    command: 'prepare',
                    platforms: ['ios']
                }
            },
            prepareAndroid: {
                options: {
                    command: 'prepare',
                    platforms: ['android']
                }
            },
            buildIos: {
                options: {
                    command: 'build',
                    platforms: ['ios']
                }
            },
            buildAndroid: {
                options: {
                    command: 'build',
                    platforms: ['android']
                }
            },
            emulateAndroid: {
                options: {
                    command: 'emulate',
                    platforms: ['android']
                }
            }
        },

        less: {
            options: {
                plugins: [ new (require('less-plugin-autoprefix'))({browsers: [ 'last 2 versions' ]}) ]
            },
            development: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: 'style.css.map',
                    sourceMapFilename: 'dist/assets/css/style.css.map'
                },
                files: {
                    'dist/assets/css/style.css': 'src/assets/styles/style.less'
                }
            },
            production: {
                options: {
                    strictMath: true
                },
                files: {
                    'dist/assets/css/style.css': 'src/assets/styles/style.less'
                }
            }
        },

        rollup: {
            options: {
                format: 'umd',
                moduleName: 'bitflux',
                globals: {
                    d3: 'd3',
                    d3fc: 'fc',
                    jquery: '$'
                }
            },
            module: {
                files: {
                    'dist/bitflux.js': ['src/assets/js/bitflux.js']
                },
                options: {
                    sourceMap: true
                }
            },
            development: {
                files: {
                    'dist/assets/js/app.js': ['src/assets/js/main.js']
                },
                options: {
                    sourceMap: true
                }
            },
            production: {
                files: {
                    'dist/assets/js/app.js': ['src/assets/js/main.js']
                }
            }
        },

        concat: {
            production: {
                src: ['<%= meta.vendorJsFiles %>', 'dist/assets/js/app.min.js'],
                dest: 'dist/assets/js/app.min.js',
                options: {
                    sourceMap: false
                }
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            production: {
                files: {
                    'dist/assets/js/app.min.js': ['dist/assets/js/app.js']
                }
            },
            module: {
                files: {
                    'dist/bitflux.min.js': ['dist/bitflux.js']
                }
            }
        },

        karma: {
            options: {
                configFile: 'karma.conf.js',
                preprocessors: {
                    'src/assets/js/**/*.js': ['browserify'],
                    'test/**/*.js': ['browserify']
                },
                exclude: ['src/assets/js/main.js'],
                files: [
                    '<%= meta.vendorJsFiles %>',
                    '<%= meta.srcJsFiles %>',
                    '<%= meta.testJsFiles %>'
                ],
                browserify: {
                    debug: true,
                    transform: ['babelify']
                }
            },
            coverage: {
                reporters: ['dots', 'coverage'],
                browsers: ['PhantomJS'],
                autoWatch: false,
                singleRun: true,
                browserify: {
                    transform: [
                        require('browserify-istanbul')({
                            instrumenter: require('isparta'),
                            ignore: ['<%= meta.testJsFiles %>']
                        }),
                        'babelify'
                    ]
                },
                coverageReporter: {
                    reporters: [
                        {
                            type: 'text'
                        },
                        {
                            type: 'text-summary'
                        },
                        {
                            type: 'html',
                            dir: '<%= meta.coverageDir %>'
                        }
                    ]
                }
            },
            chrome: {
                browsers: ['Chrome'],
                autoWatch: true,
                singleRun: false
            },
            chromeBackground: {
                browsers: ['Chrome'],
                background: true,
                singleRun: false
            },
            all: {
                browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS'],
                autoWatch: true,
                singleRun: false
            }
        },

        template: {
            development: {
                options: {
                    data: {
                        development: true,
                        appJsPath: 'assets/js/app.js',
                        liveReload: true,
                        version: 'Development',
                        developmentVendorJsFiles: '<%= meta.developmentVendorJsFiles %>'
                    }
                },
                files: {
                    'dist/index.html': ['src/index.html.tpl']
                }
            },
            production: {
                options: {
                    data: {
                        development: false,
                        appJsPath: 'assets/js/app.min.js',
                        liveReload: false,
                        version: '<%= pkg.version %>'
                    }
                },
                files: {
                    'dist/index.html': ['src/index.html.tpl']
                }
            }
        },

        'svg_sprite': {
            icons: {
                expand: true,
                cwd: 'src/assets/icons',
                src: ['**/*.svg'],
                dest: 'sprite',
                options: {
                    mode: {
                        css: {
                            dest: '',
                            sprite: 'bf-icon-sprite.svg',
                            prefix: '.bf-icon-%s',
                            dimensions: true,
                            render: {
                                less: true
                            }
                        }
                    }
                }
            }
        },

        eslint: {
            js: {
                src: ['<%= meta.ourJsFiles %>']
            }
        }

    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask('ci', [
        'build',
        'test:coverage',
        'mobile:platforms',
        'mobile:prepare'
    ]);

    grunt.registerTask('check', ['eslint']);

    grunt.registerTask('test', ['karma:all']);
    grunt.registerTask('test:chrome', ['karma:chrome']);
    grunt.registerTask('test:coverage', ['karma:coverage']);

    grunt.registerTask('build',
        'Builds the application ready for production, with option for version number to be specified',
        function() {
            var version = grunt.option('versionNumber');
            if (version) {
                grunt.config.set('template.production.options.data.version', version);
            }
            grunt.task.run('build:production');
        }
    );
    grunt.registerTask('build:production', [
        'check',
        'clean',
        'template:production',
        'rollup:production',
        'uglify:production',
        'concat:production',
        'svg_sprite',
        'less:production',
        'copy:fonts',
        'copy:icons',
        'copy:mobile']);
    grunt.registerTask('build:development', [
        'check',
        'clean',
        'template:development',
        'rollup:development',
        'svg_sprite',
        'less:development',
        'copy']);
    grunt.registerTask('build:module', [
        'check',
        'clean',
        'svg_sprite',
        'copy:icons',
        'rollup:module',
        'uglify:module']);

    grunt.registerTask('build:android', ['buildAndTest', 'cordovacli:buildAndroid']);
    grunt.registerTask('build:ios', ['buildAndTest', 'cordovacli:buildIos']);
    grunt.registerTask('mobile:platforms', [
        'cordovacli:addIos',
        'cordovacli:addAndroid'
    ]);
    grunt.registerTask('mobile:prepare', [
        'cordovacli:prepareIos',
        'cordovacli:prepareAndroid'
    ]);
    grunt.registerTask('mobile:init', [
        'buildAndTest',
        'mobile:platforms',
        'mobile:prepare'
    ]);

    grunt.registerTask('deploy', ['buildAndTest', 'gh-pages:origin']);
    grunt.registerTask('deploy:upstream', ['buildAndTest', 'gh-pages:upstream']);

    grunt.registerTask('buildAndTest', ['build', 'test:coverage']);
    grunt.registerTask('dev', ['connect:watch', 'watch:dev']);
    grunt.registerTask('devTest', ['connect:watch', 'karma:chromeBackground:start', 'watch:devTest']);

    grunt.registerTask('serve', ['connect:dist']);
};
