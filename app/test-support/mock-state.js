'use strict'

var _ = require('lodash')

module.exports = function mockState() {
    return {
        transitionTo : function(state, params) {
            this.transitionedTo = this.transitionedTo || []
            this.transitionedTo.push({ state : state, params : params } )
        },

        assertTransitionedTo : function(state) {
            return (this.transitionedTo || []).some(function(p) {
                return p.state === state
            })
        },

        assertTransitionedToWithParams : function(state, params) {
            return (this.transitionedTo || []).some(function(p) {
                return p.state === state && _.isEqual(p.params, params)
            })
        }
    }
}