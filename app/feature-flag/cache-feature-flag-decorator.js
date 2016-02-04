'use strict'

module.exports = {
    $get : cacheFeatureFlagDecoratorProvider
}

function cacheFeatureFlagDecoratorProvider($delegate, Map, $q) {
    var cache = new Map()

    return function cacheFeatureFlagDecorator(config) {
        var stringified = JSON.stringify(config),
            promise
            ;

        if(cache.has(stringified)) {
            promise = $q.when(cache.get(stringified))
        } else {
            promise = $delegate(config).then(function(active) {
                cache.set(stringified, active)
                return active
            })
        }

        return promise
    }
}

cacheFeatureFlagDecoratorProvider.$inject = [
    '$delegate',
    'Map',
    '$q'
]