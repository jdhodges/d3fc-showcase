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
                'src/assets/js/sc.js',
                'src/assets/js/event.js',
                'src/assets/js/model/**/*.js',
                'src/assets/js/chart/**/*.js',
                'src/assets/js/menu/**/*.js',
                'src/assets/js/util/**/*.js',
                'src/assets/js/data/**/*.js',
                'src/assets/js/behavior/**/*.js',
                'src/assets/js/series/**/*.js',
                'src/assets/js/app.js',
                'src/assets/js/main.js'
            ],
            testJsFiles: [
                'test/**/*Spec.js'
            ],
            ourJsFiles: [
                'Gruntfile.js',
                '<%= meta.srcJsFiles %>',
                '<%= meta.testJsFiles %>'
            ],
            vendorJsFiles: [
                'node_modules/d3fc/node_modules/d3/d3.js',
                'node_modules/d3fc/node_modules/css-layout/dist/css-layout.js',
                'node_modules/d3fc/node_modules/svg-innerhtml/svg-innerhtml.js',
                'node_modules/d3fc/dist/d3fc.js',
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/bootstrap/dist/js/bootstrap.min.js'
            ],
            coverageDir: 'coverage'
        },

        jscs: {
            options: {
                config: '.jscsrc'
            },
            failOnError: {
                files: {
                    src: ['<%= meta.ourJsFiles %>']
                }
            },
            warnOnly: {
                options: {
                    force: true
                },
                files: {
                    src: ['<%= meta.ourJsFiles %>']
                }
            }
        },

        jshint: {
            options: {
                jshintrc: true
            },
            failOnError: {
                files: {
                    src: ['<%= meta.ourJsFiles %>']
                }
            },
            warnOnly: {
                options: {
                    force: true
                },
                files: {
                    src: ['<%= meta.ourJsFiles %>']
                }
            }
        },

        watch: {
            files: ['<%= meta.srcFiles %>'],
            tasks: ['build:development'],
            options: {
                atBegin: true,
                livereload: true
            }
        },

        clean: {
            web: {
                src: ['dist']
            },
            mobile: {
                src: ['mobile/www']
            }
        },

        copy: {
            web: {
                files: [{
                    cwd: 'node_modules/bootstrap/dist/fonts/',
                    src: ['**'],
                    dest: 'dist/assets/fonts',
                    expand: true
                }]
            },
            mobile: {
                files: [
                {
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: 'mobile/www/'}
                ]
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
                    repo: 'https://github.com/ScottLogic/d3fc-showcase.git'
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

        concat: {
            development: {
                src: ['<%= meta.vendorJsFiles %>', '<%= meta.srcJsFiles %>'],
                dest: 'dist/assets/js/app.js',
                options: {
                    sourceMap: true
                }
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            production: {
                files: {
                    'dist/assets/js/app.min.js': ['<%= meta.vendorJsFiles %>', '<%= meta.srcJsFiles %>']
                }
            }
        },

        jasmine: {
            options: {
                specs: '<%= meta.testJsFiles %>',
                vendor: '<%= meta.vendorJsFiles %>',
                keepRunner: true
            },
            test: {
                src: [
                    '<%= meta.srcJsFiles %>',
                    '!src/assets/js/main.js'
                ]
            },
            coverage: {
                src: [
                    '<%= meta.srcJsFiles %>',
                    '!src/assets/js/main.js'
                ],
                options: {
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: '<%= meta.coverageDir %>/coverage.json',
                        report: [
                            {
                                type: 'html',
                                options: {
                                    dir: '<%= meta.coverageDir %>/html'
                                }
                            },
                            {
                                type: 'text-summary'
                            },
                            {
                                type: 'text'
                            }
                        ]
                    }
                }
            }
        },

        template: {
            development: {
                options: {
                    data: {
                        appJsPath: 'assets/js/app.js',
                        liveReload: true,
                        version: 'Development'
                    }
                },
                files: {
                    'dist/index.html': ['src/index.html.tpl']
                }
            },
            production: {
                options: {
                    data: {
                        appJsPath: 'assets/js/app.min.js',
                        liveReload: false,
                        version: '<%= pkg.version %>'
                    }
                },
                files: {
                    'dist/index.html': ['src/index.html.tpl']
                }
            }
        }

    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask('ci', [
            'build',
            'mobile:platforms',
            'mobile:prepare'
        ]);

    grunt.registerTask('check:failOnError', ['jshint:failOnError', 'jscs:failOnError']);
    grunt.registerTask('check:warnOnly', ['jshint:warnOnly', 'jscs:warnOnly']);
    grunt.registerTask('check', ['check:failOnError']);

    grunt.registerTask('test', ['jasmine:test']);
    grunt.registerTask('test:coverage', ['jasmine:coverage']);

    grunt.registerTask('build', ['check', 'test:coverage', 'clean',
        'template:production', 'uglify:production', 'less:production', 'copy']);
    grunt.registerTask('build:development', ['check', 'test', 'clean',
        'template:development', 'concat:development', 'less:development', 'copy']);
    grunt.registerTask('build:warnOnly', ['check:warnOnly', 'test', 'clean',
        'template:development', 'concat:development', 'less:development', 'copy']);

    grunt.registerTask('build:android', ['build', 'cordovacli:buildAndroid']);
    grunt.registerTask('build:ios', ['build', 'cordovacli:buildIos']);
    grunt.registerTask('mobile:platforms', [
            'cordovacli:addIos',
            'cordovacli:addAndroid'
        ]);
    grunt.registerTask('mobile:prepare', [
            'cordovacli:prepareIos',
            'cordovacli:prepareAndroid'
        ]);
    grunt.registerTask('mobile:init', [
            'build',
            'mobile:platforms',
            'mobile:prepare'
        ]);

    grunt.registerTask('deploy', ['build', 'gh-pages:origin']);
    grunt.registerTask('deploy:upstream', ['build', 'gh-pages:upstream']);

    grunt.registerTask('dev', ['connect:watch', 'watch']);

    grunt.registerTask('serve', ['connect:dist']);
};
