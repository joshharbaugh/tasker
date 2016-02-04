'use strict';

module.exports = EventBus

EventBus.$inject = [
    'postal'
    ,'$q'
];

function EventBus(postal, $q) {
    var CHANNEL = 'events';
    var channel = postal.channel(CHANNEL);
    return {
        publish: function(e) {
            if (!e.event) {
                throw new Error(
                    '`event` property is required for events.'
                )
            }
            return $q.when(channel.publish(e.event, e))
        }
        , reset: postal.utils.reset
        , subscribe: function(e, cb) {
            return postal.subscribe({
                channel: CHANNEL
                , topic: e
                , callback: cb
            })
        }
        , tap: function(cb) {
            return postal.addWireTap(cb)
        }
    }
}