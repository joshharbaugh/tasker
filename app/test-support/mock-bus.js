'use strict'

var _ = require('lodash')

module.exports = function mockBus() {
    return {
        publish : function(params) {
            this.published = this.published || []
            this.published.push(params)
        },

        send : function(params) {
            this.sent = this.sent || []

            if(params instanceof Array) {
                this.sent.push.apply(this.sent, params)
            } else {
                this.sent.push(params)
            }
        },

        subscribe : function() {

        },

        assertCommandSent : function(commandName, params) {
            return (this.sent || []).some(function(c) {
                var matches = c.command === commandName
                    ;

                if(matches && params) {
                    return _.isEqual(_.omit(c, 'command'), params)
                } else {
                    return matches
                }
            })
        },

        assertEventPublished : function(eventName, params) {
            return (this.published || []).some(function(e) {
                var matches = e.event === eventName
                    ;

                if(matches && params) {
                    return _.isEqual(_.omit(e, 'event'), params)
                } else {
                    return matches
                }
            })
        }
    }
}