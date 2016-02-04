'use strict';

var iFetchFeatureFlag2 = require('../feature-flag/i-fetch-feature-flag-2')

/**
 * creates a rolledup angular module with all coordination features
 * while allowing ordering of module construction
 * */
module.exports = function(cfg) {
    var angular = require('angular'),
        _ = require('lodash'),
        flaggedModule = {
            flag : '',
            active : '',
            inactive : ''
        } //convert this into a list of flagged modules

    return iFetchFeatureFlag2({ labs : true }).then(function(active) {
        var deps = [
            require('../machina-angular'),
            require('../messaging')
        ]
        .map(function(modFactory) {
            var modConfig =  modFactory[cfg.env],
                skip = {
                    skipModules : [active ? flaggedModule.inactive : flaggedModule.active]
                }
            return modFactory(null, _.extend({}, modConfig, skip))
        })
        .map(function(mod) {
            return mod.name
        })

        return angular.module('features', deps)
    })
}