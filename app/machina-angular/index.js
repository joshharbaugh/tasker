'use strict';

/**
 * @module machinaAngular
 * @desc decorates `machina` with angular lifecycle
 * */
module.exports = buildModule

function buildModule(moduleName) {
    var angular = require('angular')
        ,machina = require('machina')
        ,_ = require('lodash')
        ;

    var mod = angular.module(moduleName || 'machina-angular',[])


    mod.factory('machina',function(){
        return machina(_)
    })

    mod.provider('scopeable', require('./scopeable'))

    mod.config(['$provide','scopeableProvider', function($provide, scopeableProvider){
        $provide.decorator('machina', scopeableProvider.$get)
    }])

    mod.run(require('./tappable'))
    mod.directive('transition',require('./transition-directive'))

    return mod

}