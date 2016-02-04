angular.module('myVillages.tasker.app.userTaskOpsCodes')
    .directive('tkUserTaskOpsCodes', [function () {
    	return {
    		restrict: 'E',
    		scope: {
    			taskGroup: '=',
                notifyParent : "&method"
    		},
    		templateUrl: '/Scripts/tasker/app/userTaskOpsCodes/userTaskOpsCodes.html',
    		link: function (scope) {
    			scope.$parent.$parent.$watch('isOpen', function (open) {
    				if (open) {
    					scope.isLoading = true;
    				}
    			})
    		}
    	};
    }]);