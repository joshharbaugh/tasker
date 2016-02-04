'use strict';
angular.module('myVillages.tasker.app.userTaskQueue')
    .directive('tkUserTaskQueue', [function () {
        return {
            restrict: 'E',
            scope: {
                userTasks: '='
            },
            templateUrl: '/Scripts/tasker/app/userTaskQueue/userTaskQueue.html',
            controller: ['$scope', 'taskStatus', 'taskQueue',
				function ($scope, taskStatus, taskQueue) {

				    function getAllUserTasks() {
				        $scope.userTasksList.push($scope.$parent.ungrouppedTasksList);
				        _.each($scope.$parent.userTasksGroupsList, function () {
				            $scope.userTasksList.push(this.GroupTasks);
				        });
				        $scope.userTasksList.push($scope.$parent.sharedTasksList);
				    }

				    function createUserTaskQueues() {
				        $scope.userTaskQueues.push({ Id: taskQueue.All, Name: 'All', Count: '', ClassName: 'active' });
				        $scope.userTaskQueues.push({ Id: taskQueue.Open, Name: 'Open Tasks', Count: '', ClassName: '' });
				        $scope.userTaskQueues.push({ Id: taskQueue.PendingApproval, Name: 'Pending Your Approval', Count: '', ClassName: '' });
				        $scope.userTaskQueues.push({ Id: taskQueue.Completed, Name: 'Completed', Count: '', ClassName: '' });
				    };

				    function refreshUserTaskQueueCounts() {
				        $scope.userTaskQueues[taskQueue.All].Count = $scope.userTasksList.length;
				        $scope.userTaskQueues[taskQueue.Completed].Count = _.where($scope.$parent.userTasksList, { CurrentTaskStatus: taskStatus.Completed }).length;
				        $scope.userTaskQueues[taskQueue.Open].Count = $scope.userTaskQueues[taskQueue.All].Count - $scope.userTaskQueues[taskQueue.Completed].Count;
				        $scope.userTaskQueues[taskQueue.PendingApproval].Count = _.where($scope.$parent.userTasksList, { CurrentTaskStatus: taskStatus.PendingApproval }).length;
				    };

				    function selectUserTaskQueue(queueId) {
				        $scope.$parent.selectedQueueId = queueId;
				        $scope.$parent.showingSharedTasks = false;
				        _.each($scope.userTaskQueues, function (userTaskQueue) {
				            userTaskQueue.ClassName = '';
				        });
				        $scope.userTaskQueues[queueId].ClassName = 'active';
				    };

				    $scope.$on('UserTaskStatusUpdatedEvent', function () {
				        $scope.refreshUserTaskQueueCounts();
				    })
				    angular.extend($scope, {
				        userTaskQueues: [],
				        userTasksList: [],
				        getAllUserTasks: getAllUserTasks,
				        createUserTaskQueues: createUserTaskQueues,
				        selectUserTaskQueue: selectUserTaskQueue,
				        refreshUserTaskQueueCounts: refreshUserTaskQueueCounts
				    });
				}],
            link: function (scope, element, attrs, ctrl) {
                scope.getAllUserTasks();
                scope.createUserTaskQueues();
            }
        };
    }]);