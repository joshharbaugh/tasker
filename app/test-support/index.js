'use strict'

require('angular')
require('angular-mocks')
require('angular-ui-router')
require('ui-select')
require('./chai-setup')
require('../machina-angular')()

var _ = require('lodash')

window.check = function(done, f) {
    try {
        f()
        done()
    } catch( e ) {
        done( e )
    }
}

angular.mock.module = _.wrap(angular.mock.module, function(func) {
    var modules = [].slice.call(arguments, 1)
        ;

    modules.unshift('machina-angular')

    return func.apply(this, modules)
})