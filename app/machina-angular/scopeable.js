'use strict';

module.exports = {
    $get : getScopeable
}

/**
 * @class scopeable
 * @classdesc extends `machina.Fsm.prototype` to include function `$scoped`. This
 * places the machine into the angular $scope lifecycle.
 * @memberof scopeable
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
function getScopeable($delegate, $log) {
    var Fsm = $delegate.Fsm

    if(!Fsm) {
        throw new Error('this decorator is intended to extend machina Fsm')
    }

    function Scopeable(scope,target){
        if(!scope){
            throw new Error('scope is required')
        }
        if(!target){
            throw new Error('target is required')
        }
        this.target = target
        this.scope = scope
        this.listeners = []
        this._init()

    }
    Scopeable.prototype._init = function(){
        //all the scope listeners
        this.listeners.forEach(function(unlisten){
            //unsubscribe
            unlisten()
        })
        this.listeners.length = 0
        this.listeners.push(this.scope.$on('$destroy',this.$destroy.bind(this)))

        //magic
        //useful for passing the scope thru an object tree
        if(this.target._$scoped) {
            this.target._$scoped.apply(this.target,[this.scope])
        }

    }
    /**
     * @method $destroy
     * @desc cleanly unsubscribes
     * Note that `this` is the machina instance
     */
    Scopeable.prototype.$destroy = function $destroy(){
        var subs = (this.target.eventListeners || {})
        this.scope = undefined
        //all the scope listeners
        this.listeners.forEach(function(unlisten){
            unlisten()
        })

        if(this.target.destroy){
            //`destroy` is provided, be sure to call `off`!
            this.target.destroy()
        } else if (this.target.off){
            //no `destroy` is provided, so just unsubscribeall
            this.target.off()
        }
        this.destroyed = true
    }

    function $scoped(scope) {
        if(!scope) {
            throw new Error('scope is required')
        }
        /*
        if(this.$scopeable && !this.$scopeable.destroyed) {
            this.$scopeable = this.$scopeable.rescope(scope)
            return this
        }
        */
        this.$scopeable = new Scopeable(scope,this)
        return this
    }

    Fsm.prototype.$scoped = $scoped

    return $delegate
}

getScopeable.$inject = [
    '$delegate'
    , '$log'
]