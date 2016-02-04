'use strict';

module.exports = ['machina','$rootScope','$log',function( machina, $rootScope, $log) {



    /**
     * @class Tappable
     * @memberof machina-angular
     * @example
     * var Model = machina.Fsm.extend({
     *  //this will subscribe to events 'a' and 'b' coming from the scope.
     *  $events: ['a','b']
     *  //this will place the burden of destroying the component on the implementor,
     *  //invoked when the $scope is $destroyed
     *  ,destroy: function(){
     *      //be sure to call 'off' when you want to unsubscribe...
     *      this.off()
     *  }
     *  })
     *
     *  var instance = new Model()
     *  //associate your instance with a scope
     *  instance.$scoped(scope)
     *
     * })
     */
    function Tappable(target,scope){
        scope = (scope || $rootScope)
        if(!scope){
            throw new Error('scope is required')
        }
        if(!target){
            throw new Error('target is required')
        }
        this.target = target
        this.scope = scope
        this.listeners = []
        this._scopeAwareOff = this._scopeAwareOff.bind(this)
        this.$destroy  = this.$destroy.bind(this)
        //wire up to events
        this.$tap(this.target.$events)
        this._off = this.target.off
        this.target.off = this._scopeAwareOff.bind(this)
        this.target._off = this._off
    }
    Tappable.prototype._scopeAwareOff = function(){
        if(arguments.length) {
            this._off.apply(this.target, arguments)
            return
        }

        this.$destroy()
        this._off.apply(this.target,arguments)
        return this.target
    }
    Tappable.prototype._unsubscribe = function(e){
        //if the machine is transitioned to 'destroyed', then unsubscribe
        if(e && e.toState !== 'destroyed') {
            return
        }
        $log.debug('tappable','unsubscribing all')
        //all the scope listeners
        this.listeners.forEach(function(unlisten){
            //unsubscribe
            unlisten()
        })
    }
    Tappable.prototype.$tap = function $tap($events){
        ($events  = $events || [])
        if($events && $events.length && this.target.handle) {
            $log.debug('tappable','discovered',this.target.$events)
            var subs = $events.map(function(e){
                return this.scope.$on(e,function(){
                    var args = [].slice.call(arguments)
                    args.unshift(e)
                    $log.debug('tappable','handling',e)
                    this.target.handle.apply(this.target,args)
                }.bind(this))
            }, this)
            this.listeners = this.listeners.concat(subs)
            this.target.on('destroyed',this.$destroy)
            this.target.on('transition',this.$destroy)
        }

    }
    /**
     * @method $destroy - for cleanly unsubscribing all this tappable instance has done
     **/
    Tappable.prototype.$destroy = function(e){
        this._unsubscribe(e)
        this.target.off('destroyed',this.$destroy)
        this.target.off('transition',this.$destroy)
    }

    function wireUpNewMachina(instance){
        instance.__tappable = new Tappable(instance)
    }

    //singleton
    machina.on('newfsm',wireUpNewMachina)
    $rootScope.$on('$destroy',function(){
        machina.off('newfsm',wireUpNewMachina)
    })

}]