'use strict'

var path = require('path')

module.exports = function createBuildTemplates(grunt) {

    grunt.registerMultiTask('createTplBundle', function() {
        var buildModuleTpl = grunt.file.read('./lib/templates/templates-builder.tpl'),
            task = this

        task.files.forEach(function(fileCfg) {
            var dest = fileCfg.dest,
                sources = fileCfg.src,
                bundle

            bundle = grunt.template.process(buildModuleTpl, {
                data : {
                    tpls : sources.map(function(source) {
                        return {
                            name : source.replace(grunt.config.get('baseDirs.src'), ''),
                            path : path.join('..', '..', source)
                        }
                    })
                }
            })

            grunt.file.write(dest, bundle)
        })
    })
}