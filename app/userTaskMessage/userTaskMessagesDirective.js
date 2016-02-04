angular.module('myVillages.tasker.app.userTaskMessages')
    .directive('tkUserTaskMessages', [function () {
    	return {
    		restrict: 'E',
    		scope: {
    			parentRowId: '=',
    			parentType: '=',
    		},
    		templateUrl: '/Scripts/tasker/app/userTaskMessage/userTaskMessages.html',
    		controller: ['$scope', 'authService', 'userTaskMessagesDataService', function ($scope, authService, userTaskMessagesDataService) {

    			function getMessages() {
    				if (!$scope.isLoaded) {
    					var searchArgs = {
    						ParentRowId: $scope.parentRowId,
    						ParentType: $scope.parentType,
    					};
    					userTaskMessagesDataService.getAll(searchArgs).then(function (result) {
    						$scope.messages = result;
    						//searchArgs.MessagesCount = $scope.messages.length;
    						$scope.$emit('messagesLength', searchArgs);
    						$scope.isLoaded = true;
    					});
    				}
    			};

    			function saveUserTaskMessage() {
    				if ($scope.newMessage.Message.length > 0) {
    					$scope.newMessage.VisibleByOwner = !$scope.$parent.isServiceTechTask && $scope.newMessage.VisibleByOwner;
    					userTaskMessagesDataService.save($scope.newMessage).then(function (result) {
    						$scope.messages.splice(0, 0, result);
    						var args = {
    							ParentRowId: $scope.parentRowId,
    							ParentType: $scope.parentType
    							//MessagesCount: $scope.messages.length,
    						};
    						$scope.$emit('messagesLength', args);
    						$scope.newMessage.Message = '';
    					});
    				}
    			}

    			$scope.$on('loadMessages', function (e, args) {
    				if (args.ParentRowId == $scope.parentRowId && args.ParentType == $scope.parentType) {
    					$scope.getMessages();
    				}
    			});

    			angular.extend($scope, {
    				newMessage: {},
    				getMessages: getMessages,
    				saveUserTaskMessage: saveUserTaskMessage,
    				isLoaded: false,
    			});
    		}],
    		link: function (scope, element, attrs, ctrl) {
    			scope.newMessage = {
    				ParentRowId: scope.parentRowId,
    				ParentType: scope.parentType,
    				Message: '',
    				VisibleByOwner: !scope.$parent.isServiceTechTask
    			}
    		}
    	};
    }]);