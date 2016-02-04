;
module.exports = (function() {
    'use strict';

    function BusAngularMediator(bus, $rootScope, $log) {
        return {
            init: function() {
                $log.debug(
                    'initializing bus and linking bus to rootScope'
                );
                bus.reset();
                var untap = bus.tap(function(data, env) {
                    try {
                        if (data && data.event) {
                            return $rootScope.$broadcast(data
                                .event, data)
                        }
                    } catch (err) {
                        $log.error(
                            'Error $broadcasting event', data, err);
                        throw err
                    }
                });
                $rootScope.$on('$destroy', function() {
                    bus.publish({
                        event : 'rootScope.destroying'
                    });
                    untap()
                });
                bus.subscribe('error', function(data, env) {
                    $rootScope.$broadcast('error', data)
                });
                bus.subscribe('info', function(data, env) {
                    $rootScope.$broadcast('info', data)
                });
                $rootScope.error = function(error) {
                    $rootScope.$broadcast('error', error)
                };
                return bus
            }
            , publish: bus.publish
            , send: bus.publish
        }
    }
    BusAngularMediator.$inject = ['bus', '$rootScope', '$log'];
    return BusAngularMediator
})
    .call(this);