'use strict'

function buildModule() {
    var templateModules = {}
        , angular = require("angular")
        , mod = angular.module("templates", [])
        ;

    mod.run(["$templateCache", function($templateCache) {
    <% tpls.forEach(function(tpl) { %>
        $templateCache.put("<%= tpl.name %>", require("<%= tpl.path %>"));<% }) %>
    }])

    return mod
}

module.exports = buildModule()