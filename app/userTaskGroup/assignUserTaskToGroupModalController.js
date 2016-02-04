angular.module('myVillages.tasker.app.userTask')
    .controller('AssignUserTaskToGroupModalController', ['$scope', '$modalInstance', 'authService', 'dataService',
        function ($scope, $modalInstance, authService, dataService) {
            'use strict';
            var userRowId = authService.getAuthInfo().userRowId;

            function addGroup(group) {
            	dataService.add('UserTaskGroup', group).then(function (result) {
                    toastr['success']('Group titled \'' + group.Title + '\' created.');
                    angular.copy(result, $scope.groups[0]);
                }, function (error) {
                    toastr.error('Failed to create group titled \'' + group.Title + '\'');
                });
            };

            function assignGroup() {
                $modalInstance.close($scope.selectedGroup);
            };

            function cancel() {
                $modalInstance.dismiss('cancel');
            };

            function initialize() {
                dataService.getAll('UserTaskGroup', { 'UserRowId': userRowId }).then(function (result) {
                    angular.copy(result, $scope.groups);
                    var newGroup = new MyVillages.TaskerApp.UserTaskGroup();
                    newGroup.UserRowId = userRowId;
                    newGroup.Title = 'New Group';
                    $scope.groups.unshift(newGroup);
                }, function (error) {
                    toastr.error(error.Message);
                });
            };

            angular.extend($scope, {
                groups: [],
                selectedGroup: {},
                addGroup: addGroup,
                assignGroup: assignGroup,
                cancel: cancel
            });

            initialize();

        }
    ]);