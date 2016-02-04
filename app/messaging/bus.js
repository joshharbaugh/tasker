'use strict';
module.exports = Bus
Bus.$inject = [
    'commandBus'
    , 'eventBus'
];
function Bus(commandBus, eventBus) {
    return {
        publish: eventBus.publish
        , reset: eventBus.reset
        , send: commandBus.send
        , subscribe: eventBus.subscribe
        , tap: eventBus.tap
    }
}