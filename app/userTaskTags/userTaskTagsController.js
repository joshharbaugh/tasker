angular.module('myVillages.tasker.app.userTask')
    .controller('UserTaskTagsController', ['$scope', 'authService', 'dataService',
		function ($scope, authService, dataService) {
			'use strict';
			var userRowId = authService.getAuthInfo().userRowId;
			function initialize() {
				userTaskTagsSearch(0);
			};

			function userTaskTagsSearch(index) {
				var userTaskTag = MyVillages.TaskerApp.UserTaskTag;
				dataService.get('UserTaskTag', 3).then(function (result) {
					$scope.userTaskTags = result;
					return true;
				});
			};

			function userTaskTagPersist(index, tag) {
				var userTaskTag = {
					RowId: tag.RowId == undefined ? 0 : tag.RowId,
					UserTaskRowId: 3, //$scope.userTasks[index].RowId,
					Tag: tag.Tag
				};
				userTaskTagsDataService.userTaskTagPersist(userTaskTag).then(function (results) {
					userTaskTagsSearch(0);
				});
			};

			function userTaskTagDelete(userTaskTagId) {
				userTaskTagsDataService.userTaskTagDelete(userTaskTagId).then(function (result) {
					userTaskTagsSearch(0);
				})
			};

			initialize();

			angular.extend($scope, {
				userTasks: [{ RowId: 3 }],
				userTaskTags: [],
				userTaskTagsSearch: userTaskTagsSearch,
				userTaskTagPersist: userTaskTagPersist,
				userTaskTagDelete: userTaskTagDelete
			});

		}
    ]);