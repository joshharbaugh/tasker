angular.module('myVillages.tasker.app.equipmentSelector')
    .directive('tkEquipmentSelector', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			userToys: '=',
    			selectedToyRowId: '=',
    			selectedToyName: '=',
    			activeEquipmentIdsList: '=',
    			isSampleTask: '=',
    			isSave: '=',
    			isEdit: '=',
    			isClient: '=',
    		},
    		templateUrl: '/Scripts/tasker/app/equipmentSelector/equipmentSelector.html',
    		controller: ['$scope', '$sce', 'userTaskDataService', 'dataService', 'userTaskEquipment', '$q', '$window', '$filter', '$timeout',
				function ($scope, $sce, userTaskDataService, dataService, userTaskEquipment, $q, $window, $filter, $timeout) {

					if ($scope.selectedToyRowId) {
						getToyEquipment().then(function (result) {
							angular.forEach($scope.toyEquipment, function (eq) {
								var isActive = $scope.activeEquipmentIdsList.indexOf(eq.RowId) > -1;
								if (isActive) {
									eq.IsActive = true;
								}
								else {
									eq.IsActive = false;
								}
							});
						});
					};

					function changeToy() {
						getToyEquipment().then(function (result) {
							$scope.activeEquipmentIdsList = [];
							angular.forEach($scope.toyEquipment, function (eq) {
								eq.IsActive = false;
							});
						});
					};

					function getToyEquipment() {
						return userTaskDataService.getToyEquipment($scope.selectedToyRowId).then(function (result) {
							$scope.toyEquipment = result;
						});
					};

					function equipmentSelection(eq) {
						eq.IsActive = true;
						$scope.activeEquipmentIdsList.push(eq.RowId);
					};

					function removeEqupment(eq) {
						eq.IsActive = false;
						var ind = $scope.activeEquipmentIdsList.indexOf(eq.RowId);
						if (ind > -1) {
							$scope.activeEquipmentIdsList.splice(ind, 1);
						}
					};

					function clearToyEqupment(isToy) {
						if ($scope.isSampleTask) return;
						if (isToy) {
							$scope.selectedToyRowId = null;
							$scope.toyEquipment = [];
						}
						else {
							_.forEach($scope.toyEquipment, function (eq) {
								eq.IsActive = false;
								eq.LastLoggedUsageDisplay = "";
							});
						}
						$scope.activeEquipmentIdsList = [];
					};

					function saveBoatEquipment() {
						if ($scope.isSampleTask) return;

						$scope.$parent.userTask.ToyRowId = $scope.selectedToyRowId;
						$scope.$parent.userTask.SelectedToyEquipmentIdsList = $scope.activeEquipmentIdsList;
						$scope.$parent.userTask.EquipmentPersistType = userTaskEquipment.EquipmentModified;
						$scope.$parent.userTask.IsStatusChange = false;
						$scope.$parent.updateUserTask('Task Boat/Equipment has been saved');
					};

					$scope.$on('userTaskPosted', function (e, args) {
						if (args.toyRowId) {
							$scope.setActiveEquipment();
						}
					});

					$scope.$on('clientStuff', function (e, args) {
						$scope.toyEquipment = [];
						$scope.activeEquipmentIdsList = [];
					});

					angular.extend($scope, {
						toyEquipment: [],
						getToyEquipment: getToyEquipment,
						changeToy: changeToy,
						equipmentSelection: equipmentSelection,
						saveBoatEquipment: saveBoatEquipment,
						clearToyEqupment: clearToyEqupment,
						removeEqupment: removeEqupment,
					});

				}],
    		link: function (scope, element, attrs, ctrl) {
    		}
    	};
    }]);