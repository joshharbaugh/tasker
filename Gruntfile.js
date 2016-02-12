'use strict';

try {
    var createTplBundle = require('./lib/templates/create-tpl-bundle'),
        stat = require('./lib/stat/stat'),
        when = require('when')
} catch(e) {}

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    /*** Configure our grunt tasks ***/

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        baseDirs : {
            src : 'app',
            build : 'build',
            support : 'test-support',
            dist : 'dist',
            tmp : 'tmp'
        },

        config: {
            dev: {
                options: {
                    variables: {
                        'env': 'dev'
                    }
                }
            },
            prod: {
                options: {
                    variables: {
                        'env': 'prod'
                    }
                }
            }
        },

        externalAssets : {
            jquery : 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
            angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.10/angular.min.js',
            mocks:   'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.10/angular-mocks.js',
            ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.10/angular-route.min.js',
            ngSanitize : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.10/angular-sanitize.min.js',
            ngAnimate : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.10/angular-animate.min.js',
            uiBootstrap : 'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.3/ui-bootstrap-tpls.min.js'
        },

        src : {
            tests : {
                supportFiles : '<%= baseDirs.support %>/index.js',
                specs : '<%= baseDirs.src %>/**/*-spec.js'
            },
            externalModules : {
                angular : './<%= baseDirs.src %>/test-support/angular-shim.js',
                angularMocks : './<%= baseDirs.src %>/test-support/angular-mocks-shim.js',
                jQuery : './<%= baseDirs.src %>/test-support/jquery-shim.js'
            },
            templates : '<%= baseDirs.src %>/**/*.html',
            specs : '<%= baseDirs.src %>/**/*-spec.js',
            specsSupport : '<%= baseDirs.src %>/test-support/index.js',
            lib : '<%= baseDirs.src %>/boot/index.js',
        },

        build : {
            dev : {
                base : '<%= baseDirs.build %>/dev',
                templates : '<%= build.dev.base %>/<%= fversion %>/templates.js',
                lib : '<%= build.dev.base %>/<%= fversion %>/build.js',
                templatesList : '<%= build.dev.base %>/templates-list.js',
                mainPage : '<%= build.dev.base %>/index.html',
                assets : '<%= build.dev.base %>',
                manifest : '<%= build.dev.base %>/build-manifest.json'
            },
            prod : {
                base : '<%= baseDirs.build %>/prod',
                templates : '<%= build.prod.base %>/<%= fversion %>/templates.js',
                templatesList : '<%= build.prod.base %>/templates-list.js',
                lib : '<%= build.prod.base %>/<%= fversion %>/build.js',
                mainPage : '<%= build.prod.base %>/index.html',
                assets : '<%= build.prod.base %>',
                manifest : '<%= build.prod.base %>/build-manifest.json'
            },
            test : {
                base : '<%= baseDirs.build %>/test',
                specs : '<%= build.test.base %>/specs.js',
                specsSupport : '<%= build.test.base %>/specs-support.js'
            }
        },

        dist : {
            packageName : '<%= baseDirs.dist %>/<%= fversion %>.tar.gz'
        },

        watch: {
            scripts: {
                files: ['app/{,*/}*.js'],
                tasks: ['concat', 'uglify:dist'],
                options: {
                    nospawn: true
                },
            },
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'scripts.js',
                        'scripts.min.js',
                    ]
                }]
            },
            test : {
                src : ['<%= build.test.base %>']
            },
            tmp : {
                src : ['<%= baseDirs.tmp %>']
            },
            dev : {
                src : ['<%= build.dev.base %>']
            },
            prod : {
                src : ['<%= build.prod.base %>']
            },
            build : {
                src : ['<%= baseDirs.dist %>']
            },
            options: {
                force: true
            }
        },

        test: {
            karmaConfig: '../tests/config/karma.conf.js',
            unit: ['../tests/unit/**/*.js']
        },

        karma: {
            // Used in local development
            local: {
                configFile: '<%= test.karmaConfig %>',
                browsers: ['Chrome']
            },
            // Used for debugging in local development 
            debug: {
                configFile: '<%= test.karmaConfig %>',
                browsers: ['Chrome'],
                singleRun: false,
                autoWatch: true
            },
            // CI to publish Junit and Coverage reports to SONAR
            ci: {
                configFile: '<%= test.karmaConfig %>',
                singleRun: true,
                reporters: ['dots', 'coverage', 'junit'],
                browsers: ['PhantomJS'],
                coverageReporter: {
                    type: 'lcovonly',
                    dir: 'tests/reports/'
                }
            },
            // Generates Unit Test Coverage in Local
            coverage: {
                configFile: '<%= test.karmaConfig %>',
                singleRun: true,
                browsers: ['PhantomJS'],
                reporters: ['coverage', 'dots']
            }
        },

        ngtemplates: {
            app: {
                src: 'app/{,*/}{,*/}*.html',
                dest: 'app/templates.js',
                options: {
                    module: 'myVillages.tasker.app.templates',
                    standalone: true,
                    htmlmin: {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true
                    },
                    prefix: '/Scripts/tasker/'
                }
            }
        },

        concat: {
            app_scripts: {
                options: {
                    separator: ';'
                },
                dest: 'scripts.js',
                src: [
                    "app/templates.js",
                    "app/initNs.js",
                    "app/app.js",
                    "app/config.js",
                    "app/enums.js",

                    "app/models/model.entity.js",
                    "app/common/directives/requiredLabelDirective.js",
                    "app/common/directives/backgroundUrlDirective.js",
                    "app/common/directives/showErrorsDirective.js",
                    "app/common/directives/breadcrumbsDirective.js",
                    "app/common/directives/stickyDirective.js",
                    "app/common/directives/workspaceDirective.js",
                    "app/common/directives/opCodesSelect.js",
                    "app/common/directives/clientWorkOrders.js",

                    "app/common/services/authService.js",
                    "app/common/services/authInterceptorService.js",
                    "app/common/services/dataService.js",
                    "app/common/services/modalService.js",
                    "app/common/services/debounceFactory.js",

                    "app/models/model.userTask.js",
                    "app/userTask/userTaskManagerController.js",
                    "app/userTask/parentGridController.js",
                    "app/userTask/parentGridService.js",
                    "app/userTask/userTaskGridController.js",
                    "app/userTask/userTaskDataService.js",
                    "app/userTask/userTaskGridService.js",
                    "app/userTask/userTaskDataServiceDM.js",
                    "app/userTask/userTasksUserXrefDataService.js",
                    "app/userTask/userTaskDirective.js",
                    "app/userTask/createTaskDirective.js",
				    "app/bulkActionsMenu/bulkActionsMenuDirective.js",
                    "app/userTaskOpsCodes/userTaskOpsCodesController.js",
                    "app/userTaskOpsCodes/userTaskOpsCodesDataService.js",
                    "app/userTaskOpsCodes/userTaskOpsCodesDataServiceDM.js",
                    "app/userTaskOpsCodes/userTaskOpsCodesDirective.js",
                    "app/assignListTasks/assignListTasksDirective.js",
				    "app/reassignSupervisor/reassignSupervisorDirective.js",
				    "app/assignServiceTech/assignServiceTechDirective.js",
				    "app/assignSubcontractor/assignSubcontractorDirective.js",

                    "app/models/model.userTaskMessage.js",
                    "app/userTaskMessage/userTaskMessagesDirective.js",
                    "app/userTaskMessage/userTaskMessagesDataService.js",

                    "app/models/model.userTaskEstimate.js",

				    "app/equipmentSelector/equipmentSelectorDirective.js",

                    "app/linkedMedia/linkedMediaDirective.js",
                    "app/linkedMedia/linkedMediaDataService.js",
                    "app/models/model.linkedMedia.js",

                    "app/models/model.userTaskGroup.js",
                    "app/userTaskGroup/userTaskGroupsDirective.js",

                    "app/myStuff/myStuffManagerController.js",

                    "app/userTaskSmartGroup/userTaskSmartGroupDataService.js",
                    "app/userTaskSmartGroup/userTaskSmartGroupDirective.js",

                    "app/userTaskPermissions/permissionsDataService.js",
                    "app/userTaskPermissions/permissionsManagerController.js",

                    "app/userTaskHour/userTaskHourDirective.js",
                    "app/userTaskHour/userTaskHourDataServiceDM.js",
                    "app/userTaskPart/userTaskPartController.js",

                    "app/serviceTech/serviceTechDataService.js",
                    "app/userTaskServiceTech/userTaskServiceTechDataService.js",

                    "app/models/model.userTaskFeedback.js",
                    "app/models/model.userTaskNote.js",

                    "app/models/model.userTaskServiceTechXref.js",

                    "app/tutorial/joyride.js",
                    "app/tutorial/tutorialDirective.js",

                    "app/supervisor/supervisorDataService.js",

                    "app/heartbeat/heartbeatDashboardController.js",
                    "app/heartbeat/datetimeFiltersDirective.js",
                    "app/heartbeat/recentActivityDirective.js",
                    "app/heartbeat/estimatesRequestedDirective.js",
                    "app/heartbeat/clientRemindersDirective.js",
                    "app/heartbeat/techStatusUpdatesDirective.js",
                    "app/heartbeat/recentMessagesDirective.js",

                    "app/azureServiceBus/azureServiceBusQueueService.js"
                ]
            }
        },

        useminPrepare: {
            html: '../Views/Tasker/Index_Build.cshtml',
            options: {
                dest: '../Views/Tasker/Index.cshtml',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs']
                        },
                        post: {}
                    }
                }
            }
        },

        usemin: {
            html: ['../Views/Tasker/Index.cshtml'],
            options: {
                dirs: ['../Views']
            }
        },

        uglify: {
            dist: {
                files: {
                    'scripts.min.js': ['scripts.js']
                }
            },
            lib : {
                src : ['<%= build.prod.lib %>'],
                dest : '<%= build.prod.lib %>'
            },
            templates : {
                src : ['<%= build.prod.templates %>'],
                dest : '<%= build.prod.templates %>'
            }
        },

        filerev: {
            dist: {
                src: [
                    'scripts.min.js'
                ]
            }
        },

        compress : {
            dist : {
                options : {
                    mode : 'tgz',
                    archive : '<%= dist.packageName %>'
                },
                files : [
                    {
                        expand : true,
                        src : ['*'],
                        dest : '/',
                        flatten : false,
                        cwd : '<%= build.prod.base %>'
                    },
                    {
                        expand : true,
                        src : ['<%= fversion %>/*'],
                        dest : '/',
                        flatten : false,
                        cwd : '<%= build.prod.base %>'
                    }
                ]
            }
        },

        manifest : {
            dev : true,
            prod : true
        },

        createTplBundle : {
            dev : {
                src :  ['<%= src.templates.ngTemplates %>'],
                dest:   '<%= build.dev.templatesList %>'
            },
            prod : {
                src :  ['<%= src.templates.ngTemplates %>'],
                dest:   '<%= build.prod.templatesList %>'
            }
        },

        copy : {
            dev : {
                files : [
                    {
                        expand: true,
                        src: [],
                        dest: '<%= build.dev.assets %>',
                        flatten : true
                    }
                ]
            },

            prod : {
                files : [
                    {
                        expand: true,
                        src: [
                            '<%= src.assets.icons %>',
                            '<%= src.assets.fonts %>'
                        ],
                        dest: '<%= build.prod.assets %>',
                        flatten : true
                    }
                ]
            }
        },

        browserify: {
            templatesDev : {
                options : {
                    external : ['angular'],
                    transform : [['html2js-browserify', {
                        global : true
                    }]],
                    browserifyOptions : {
                        fullPaths : false
                    },
                    watch : true
                },
                src : ['<%= build.dev.templatesList %>'],
                dest : '<%= build.dev.templates %>'
            },
            templatesProd : {
                options : {
                    external : ['angular'],
                    transform : [['html2js-browserify', {
                        global : true
                    }]],
                    browserifyOptions : {
                        fullPaths : false
                    }
                },
                src : ['<%= build.prod.templatesList %>'],
                dest : '<%= build.prod.templates %>'
            },
            libDev : {
                options : {
                    alias : [
                        './<%= src.externalModules.angular %>:angular',
                        './<%= src.externalModules.jQuery %>:jQuery',
                        './<%= src.lib %>:coordination'
                    ],
                    browserifyOptions : {
                        debug : true,
                        fullPaths : false
                    },
                    watch : true
                },
                src : [],
                dest : '<%= build.dev.lib %>'
            },
            libProd : {
                options : {
                    alias : [
                        './<%= src.externalModules.angular %>:angular',
                        './<%= src.externalModules.jQuery %>:jQuery',
                        './<%= src.lib %>:coordination'
                    ],
                    browserifyOptions : {
                        fullPaths : false
                    }
                },
                src : [],
                dest : '<%= build.prod.lib %>'
            },
            specsSupport : {
                options : {
                    alias : [
                        './<%= src.externalModules.angular %>:angular',
                        './<%= src.externalModules.angularMocks %>:angular-mocks',
                        './<%= src.externalModules.jQuery %>:jQuery'
                    ],
                    watch : true
                },
                src : ['<%= src.specsSupport %>'],
                dest : '<%= build.test.specsSupport %>'
            },
            specsDev : {
                options : {
                    watch : true,
                    external : ['angular', 'angular-mocks', 'jQuery'],
                    transform : ['html2js-browserify'],
                    browserifyOptions : {
                        debug : true
                    }
                },
                src : ['<%= src.specs %>'],
                dest : '<%= build.test.specs %>'
            },
            specsProd : {
                options : {
                    external : ['angular', 'angular-mocks', 'jQuery'],
                    transform : ['html2js-browserify', 'browserify-istanbul']
                },
                src : ['<%= src.specs %>'],
                dest : '<%= build.test.specs %>'
            }
        }

    });

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'ngtemplates',
        'concat',
        'uglify:dist',
        //'filerev',
        'usemin'
    ]);
    grunt.registerTask('serve', ['ngtemplates', 'concat', 'uglify:dist', 'watch']);
    grunt.registerTask('testLocal', ['karma:local']);


    /* Begin new tasks for refactor */
    grunt.registerMultiTask('manifest', 'Creates a compressed package of the application', function() {
        var done = this.async(),
            target = this.target,
            manifestFile = grunt.config.process('<%= build.' + target + '.manifest %>'),
            manifest = grunt.file.exists(manifestFile) ? when(grunt.file.readJSON(manifestFile)) : stat()

        manifest.then(function(data) {
            grunt.config.set('fversion', data.fversion)
            grunt.file.write(manifestFile, JSON.stringify(data))
            done()
        })
    })

    grunt.registerTask('templates:dev', 'Creates a dev templates bundle', [
        'createTplBundle:dev',
        'browserify:templatesDev'
    ])

    grunt.registerTask('templates:prod', 'Creates a dev templates bundle', [
        'createTplBundle:prod',
        'browserify:templatesProd'
    ])

    grunt.registerTask('build:dev', 'Creates a development build', [
        'clean:tmp',
        'clean:dev',
        'manifest:dev',
        'templates:dev',
        'browserify:libDev',
        'copy:dev',
        'clean:tmp'
    ])

    grunt.registerTask('build:prod', 'Creates a production build', [
        'clean:tmp',
        'clean:prod',
        'templates:prod',
        'browserify:libProd',
        'uglify:lib',
        'uglify:templates',
        'copy:prod',
        'clean:tmp'
    ])

    grunt.registerTask('dist', 'Creates a distribution build', [
        'clean:build',
        'build:prod',
        'compress:dist'
    ])

    //loading our custom tasks
    createTplBundle(grunt)

    // grunt.loadNpmTasks('grunt-karma')
    // grunt.loadNpmTasks('grunt-config')
    // grunt.loadNpmTasks('grunt-contrib-copy')
    // grunt.loadNpmTasks('grunt-contrib-clean')
    // grunt.loadNpmTasks('grunt-browserify')
    // grunt.loadNpmTasks('grunt-contrib-uglify')
    // grunt.loadNpmTasks('grunt-contrib-watch')
    // grunt.loadNpmTasks('grunt-contrib-compress')
    // grunt.loadNpmTasks('grunt-newer')
};
