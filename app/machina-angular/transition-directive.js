'use strict';

module.exports = TransitionDirective

TransitionDirective.$inject = [
    '$document'
]
function TransitionDirective($document){
    return {
        restrict: 'A'
        ,link: function(scope, el, attrs) {
            var ESC = 27
            var doc = $document[0]
                ,elm = el[0]
                ;

            function enabled(){
                var machine = scope.$eval(attrs.transition)
                if(!machine) {
                    return
                }
                //optional
                var when = attrs['transitionWhen']
                if(when && machine.state !== when) {
                    return false
                }
                return machine

            }
            function handle(e){
                var key = (e.keyCode && e.which)
                if(key && key !== ESC) {
                    return false
                }
                var machine = enabled()
                if(!machine) {
                    return
                }
                scope.$apply(function(){
                    var withState = (attrs['transitionWith'] || 'cancel')
                    machine.handle(withState)
                })
            }
            function stop(e){
                if(!enabled()) {
                    return
                }
                return e.stopPropagation()
            }
            elm.addEventListener('click',stop)
            doc.addEventListener('click',handle)
            doc.addEventListener('keyup',handle)
            scope.$on('$destroy',function(){
                doc.removeEventListener('click',handle)
                doc.removeEventListener('keyup',handle)
                elm.removeEventListener('click',stop)

            })

        }
    }
}