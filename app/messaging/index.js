'use strict';

module.exports = buildModule

function buildModule(moduleName) {
    var angular = require('angular')
        ,_ = require('lodash');

    var mod = angular.module(moduleName || 'messaging', []);
    var postal = require('postal');
    mod.factory('lodash', function() {
        return _
    });
    mod.factory('postal', ['lodash', function(_) {
            if (_.isFunction(postal)) {
                return postal(_)
            }
            return postal
        }
    ]);
    mod.factory('eventBus', require('./event-bus'));
    mod.provider('commandBus', require('./command-bus'));
    mod.factory('bus', require('./bus'));
    mod.factory('busAngularMediator', require( './bus-angular-mediator'));
    mod.run(['busAngularMediator', function(Mediator) {
            Mediator.init()
        }
    ]);
    return mod
}