'use strict';


CommandBus.$inject = ['$q', '$log', '$injector', 'lodash'];

module.exports = {
    $get: CommandBus
}

function CommandBus($q, $log, $injector, _) {
    function validate(command) {
        if (!command.command) {
            throw new Error(
                'The `command` property is required when sending a command. Please check your payload.'
            )
        }
    }

    function execute(command) {
        try {
            var handler = $injector.get(command.command +
                'Handler');
            return $q.when(handler.apply(this, [command]))
        } catch (err) {
            //ng 1.2 + has different error message for
            //no provider found
            if (err.toString()
                .indexOf('[$injector:unpr]') > -1) {
                throw new Error('Command handler for \'' +
                    command.command + '\'' +
                    ' could not be found.')
            }
            $log.error(err.toString());
            $q.reject(err);
            throw err
        }
    }
    var bus = {
        send: function(commands) {
            if (!_.isArray(commands)) {
                commands = [commands]
            }
            _.each(commands, validate);
            var all = _.map(commands, execute);
            return $q.all(all)
        }
    };
    return bus
}