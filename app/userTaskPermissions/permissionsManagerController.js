angular.module('myVillages.tasker.app.userTaskPermissions')
    .controller('UserTaskPermissionsController', ['$scope', 'authService', 'userTaskPermissionsDataService', 'taskerPermission',
function ($scope, authService, userTaskPermissionsDataService, taskerPermission) {
	'use strict';
	var userRowId = authService.getAuthInfo().userRowId;

	function initialize() {
		getPermissions();
	};

	function getPermissions() {
		var userTaskPermissionsArgs = {
			ClientRowId: userRowId
		};
		var userTaskPromise = userTaskPermissionsDataService.getPermissions(userTaskPermissionsArgs).then(function (result) {
			$scope.permissions = result;
		});
	};

	function getSuggestedServiceProviders(searchKeyword) {
		return userTaskPermissionsDataService.getSuggestedServiceProviders(searchKeyword).then(function (results) {
			return results;
		});
	};

	function selectPro(data) {
		if (typeof data === 'object') {
		}
		else {
			$scope.selectedPro.BusinessRowId = null;
			toastr.error('Please select Service Provider from the list');
		}
	};

	function updatePermissions(mode) {
		if (mode == 'add' && $scope.selectedPro.BusinessRowId == null) {
			toastr.error('Please select Service Provider from the list');
			return false;
		}
		var serviceProvidersPermissionsList = [];
		var userTaskPermissionsArgs;
		var userTaskPermissionEx;
		switch (mode) {
			case 'add':
				userTaskPermissionEx = buildPermissionsModel($scope.selectedPro);
				serviceProvidersPermissionsList.push(userTaskPermissionEx);
				$scope.selectedPro = {
					BusinessRowId: null,
					TypeaheadDisplay: '',
					IsDenyCreatingTask: false,
					IsDenyViewingTaskHistory: false
				};
				break;
			case 'update':
				$.each($scope.permissions, function () {
					userTaskPermissionEx = buildPermissionsModel(this);
					serviceProvidersPermissionsList.push(userTaskPermissionEx);
				});
				break;
		}
		var userTaskPermissionsArgs = {
			ServiceProvidersPermissionsList: serviceProvidersPermissionsList
		};
		userTaskPermissionsDataService.updatePermissions(userTaskPermissionsArgs).then(function (result) {
			$scope.getPermissions();
			toastr.success(mode == 'add' ? 'Permissions have been added' : 'Permissions have been updated');
		});
	};

	function buildPermissionsModel(permission) {
		var userTaskPermissionEx = {
			OwnerRowId: userRowId,
			BusinessRowId: permission.AssignedUserRowId ? permission.AssignedUserRowId : permission.ServiceProvider.AssignedUserRowId,
			PermissionsList: []
		};
		if (permission.IsDenyCreatingTask) {
			userTaskPermissionEx.PermissionsList.push({ RowId: taskerPermission.DenyCreatingClientTask });
		}
		if (permission.IsDenyViewingTaskHistory) {
			userTaskPermissionEx.PermissionsList.push({ RowId: taskerPermission.DenyViewingTaskHistory });
		}
		return userTaskPermissionEx;
	};

	initialize();

	angular.extend($scope, {
		getPermissions: getPermissions,
		updatePermissions: updatePermissions,
		getSuggestedServiceProviders: getSuggestedServiceProviders,
		selectPro: selectPro,
		permissionTypes: [
			{
				"title": "Deny Creating Task on Behalf Of",
				"description": "Deny service providers an ability to create tasks on your behalf to be assigned to them."
			},
			{
				"title": "Grant Full History Permissions",
				"description": "Grant service providers ability to see history of all your tasks, including those completed to other providers."
			}
		],
		permissions: [],
		selectedPro: {
			BusinessRowId: null,
			TypeaheadDisplay: '',
			IsDenyCreatingTask: false,
			IsDenyViewingTaskHistory: false
		}
	});

}
    ]);