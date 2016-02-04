angular.module('myVillages.tasker.app.userTask')
    .controller('UserTaskPartController', ['$scope', 'authService', 'dataService',
		function ($scope, authService, dataService) {
		    'use strict';
		    var userRowId = authService.getAuthInfo().userRowId;
		    function initialize() {
                // do some stuff
		    };

		    function userTaskPartRead(userTaskPartId) {
		        //var userTaskPart = MyVillages.TaskerApp.UserTaskPart;
		        var searchArgs = {
		            UserTaskRowId: userTaskRowId
		        };
		        //dataService.get('UserTaskPart', userTaskPartId, {}).then(function (result) {
		        //    $scope.userTaskPart = result;
		        //});
		    };

		    function userTaskPartSearch(userTaskRowId) {
		        //var userTaskPart = MyVillages.TaskerApp.UserTaskPart;
		        var searchArgs = {
                    UserTaskRowId: userTaskRowId
		        };
		        //dataService.getAll('UserTaskPart', searchArgs, {}).then(function (result) {
		        //    $scope.userTaskParts = result;
		        //});
		    };

		    function userTaskPartPersist(index, part) {
		       /* var userTaskPart = {
		            RowId: part.RowId == undefined ? 0 : tag.RowId,
		            UserTaskRowId: part.UserTaskRowId,
		            Name: part.Name,
		            Description: part.Description,
		            Quantity: part.Quantity,
		            VendorName: part.VendorName,
		            ItemNumber: part.ItemNumber,
                    Location: part.Location
		        }; */
		        if (part.Description == null || part.Description.length < 1) return;
		        dataService.add('UserTaskPart', part).then(function (result) {
		            toastr.success('Part saved successfully');
		            part.RowId = result.RowId;
		        }, function (error) {
		            toastr.error(error.Message);
		        });
		    };

		    function userTaskPartDelete(userTaskPartId, UserTaskHourParts, index) {
		        var confirm = window.confirm('Are you sure you want to remove this part?');
		        if (confirm) {
		            dataService.remove('UserTaskPart', userTaskPartId).then(function (result) {
		                UserTaskHourParts.splice(index, 1);
		            });
		        }
		    };

		    initialize();

		    angular.extend($scope, {
		        userTaskParts: [],
                userTaskPartRead: userTaskPartRead,
		        userTaskPartSearch: userTaskPartSearch,
		        userTaskPartPersist: userTaskPartPersist,
		        userTaskPartDelete: userTaskPartDelete
		    });

		}
    ]);