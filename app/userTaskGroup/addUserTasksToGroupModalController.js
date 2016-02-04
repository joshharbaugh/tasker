angular.module('myVillages.tasker.app.userTask')
    .controller('AddUserTasksToGroupModalController', ['$scope', '$modalInstance', 'authService', 'userTaskGroupRowId', 'userTasks',
        function ($scope, $modalInstance, authService, userTaskGroupRowId, userTasks) {
            'use strict';

            function addTasksToGroup() {
                $modalInstance.close($scope.selectedTaskRowIds);
            };

            function toggleSelectedTask(userTaskRowId) {
                var idx = $scope.selectedTaskRowIds.indexOf(userTaskRowId);
                // is currently selected
                if (idx > -1) {
                    $scope.selectedTaskRowIds.splice(idx, 1);
                }
                // is newly selected
                else {
                    $scope.selectedTaskRowIds.push(userTaskRowId);
                }
            };

            function cancel() {
                $modalInstance.dismiss('cancel');
            };

            function initialize() {
                angular.copy(_.filter(userTasks, function(userTask) { return !userTask.UserTaskGroupRowId }), $scope.tasksWithNoGroup);
            };

            angular.extend($scope, {
                tasksWithNoGroup: [],
                selectedTaskRowIds: [],
                addTasksToGroup: addTasksToGroup,
                toggleSelectedTask: toggleSelectedTask,
                cancel: cancel
            });

            initialize();

        }
    ]);