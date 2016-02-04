'use strict';
/**
 * @module crunch
 * @desc Application thing
 */

function assert(assertion, message) {
    if(!assertion) {
        throw new Error(message)
    }
}

var modules = [],
    manifest

function Application(initialModules) {
    var endpoints = window.endpoints

    modules = modules.concat(initialModules)
    this.COOKIE_DOMAIN = '.mytaskit.com'
    this.PUBLIC_URL = endpoints && endpoints.public
    this.SECURE_URL = endpoints && endpoints.secure

    window.endpoints = undefined
}

Application.prototype.boot = function() {
    var angular = require('angular'),
        entryPointModule,
        applicationManifestMod = angular.module('application-manifest', []),
        app = this,
        $ = require('jQuery')
        ;

    applicationManifestMod.constant('applicationManifest', manifest)

    modules.push(applicationManifestMod.name)

    return $.getJSON(this.PUBLIC_URL).then(function(response) {
        entryPointModule = angular.module('coordination', modules)

        entryPointModule.constant('COOKIE_DOMAIN', this.COOKIE_DOMAIN);
        entryPointModule.constant('PUBLIC_URL',this.PUBLIC_URL)
        entryPointModule.constant('PUBLIC_API', response)
        entryPointModule.constant('SECURE_URL', this.SECURE_URL)

        angular.bootstrap(document, [entryPointModule.name], {
            strictDi : true
        })

        return app
    })

}

Application.prototype.registerExternalModule = function(moduleName) {
    assert(modules.indexOf(moduleName) === -1, 'This module is already registered')
    assert(typeof moduleName === 'string', 'Provide a module name')
    modules.push(moduleName)
}

Object.defineProperties(Application.prototype, {
    manifest : {
        get : function() {
            return manifest
        },

        set : function(value) {
            manifest = value
        }
    }
})

function buildApplication(cfg) {
    var _ = require('lodash'),
        featuresList = require('./features-list'),
        extendedCfg = _.defaults(cfg || {}, {
            env : 'prod'
        })

    require('angular-ui-router')
    require('ui-select')

    return featuresList(extendedCfg).then(function(features) {
        var dependencies = [
            'ngSanitize',
            'ngRoute',
            'ngAnimate',
            'ui.bootstrap',
            'ui.select',
            'templates',
            features.name
        ]

        return new Application(dependencies)
    })
}

module.exports = buildApplication