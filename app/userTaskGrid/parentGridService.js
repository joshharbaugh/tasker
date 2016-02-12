angular.module('myVillages.tasker.app.userTaskGrid')
    .service('parentGridService', ['userTaskGridDataService', '$routeParams', 'authService', '$q',
        function (userTaskGridDataService, $routeParams, authService, $q) {
            'use strict';

            var populateMasterData = function (task, propertyName, type, scope) {
                if (type == 'task') {
                    if (task[propertyName] && task[propertyName] !== '') {
                        scope.filterMasterData[propertyName].push(task[propertyName]);
                    }
                }
            };

            var assignProperty = function (groupTasks, taskList, propertyName, list, toolTip, scope) {
                if (typeof groupTasks !== 'undefined') {
                    var properArray = [];
                    var tootTipText = '';
                    groupTasks.forEach(function (childNode) {
                        if (typeof childNode !== 'undefined') {
                            if (childNode[propertyName]) {
                                properArray.push(childNode[propertyName]);
                            }
                        }
                    });
                    properArray = _.uniq(properArray);
                }
                if (!scope.filterMasterData[propertyName]) {
                    scope.filterMasterData[propertyName] = [];
                }
                if (properArray.length == 1) {
                    taskList[propertyName] = properArray[0];
                    taskList[toolTip] = properArray[0];
                    scope.filterMasterData[propertyName].push(properArray[0]);
                } else if (properArray.length > 1) {
                    taskList[propertyName] = 'Multiple';
                    taskList[list] = properArray;
                    taskList[toolTip] = properArray.join();
                    scope.filterMasterData[propertyName].push(properArray[0]);
                } else {
                    taskList[propertyName] = '';
                }
                scope.filterMasterData[propertyName] = _.uniq(scope.filterMasterData[propertyName]);
            };

            var removeDuplicates = function (scope) {
                for (var k in scope.filterMasterData) {
                    if (scope.filterMasterData.hasOwnProperty(k)) {
                        scope.filterMasterData[k] = _.uniq(scope.filterMasterData[k]);
                    }
                }
            };

            this.saveRowIndexing = function(scope) {
                var taskAndGroupRowIndexes = [];
                _.map(scope.gridApi.grid.rows, function(row, key){
                    taskAndGroupRowIndexes.push({
                        "isTask": row.entity.isTask,
                        "RowId": row.entity.RowId,
                        "RowDisplayIndex": key
                    });
                    scope.gridApi.grid.rows[key].entity.RowDisplayIndex = key;
                });
                userTaskGridDataService.userTaskAndGroupIndexUpdate(taskAndGroupRowIndexes).then(function(){
                    toastr.success('Sorting has been saved');
                });
            };

            this.getSortedTasksAndGroups = function(scope) {
                var deferred = $q.defer();
                scope.loading = true;
                var userTaskSearchArgs = {
                    SearchType: 1, // search user tasks
                    AssignedUserId: $routeParams.clientId ? $routeParams.clientId : authService.getAuthInfo().userRowId,
                    Keyword: '',
                    Status: -1,
                    IsFiltersLoaded: true,
                    TaskQueue: 1
                };
                userTaskGridDataService.getAllForGrid(userTaskSearchArgs).then(function (tasksAndGroups) {
                    deferred.resolve(tasksAndGroups);
                 }).finally(function () {
                    scope.loading = false;
                });
                return deferred.promise;
            };

            this.getUserTaskGridOptions = function(scope){
                return {
                    rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div></div>',
                    enableFiltering: true,
                    useExternalSorting: true,
                    multiSelect: true,
                    enableGridMenu: true,
                    enableColumnResizing: true,
                    enableGroupHeaderSelection: true,
                    showGroupPanel: true,
                    jqueryUIDraggable: true,
                    rowHeight: 60,
                    showGridFooter: true,
                    columnDefs: [
                    {
                        field: 'ClientDisplayName',
                        displayName: 'Client Name',
                        width: '15%',
                        cellClass: 'ui-grid-center-align',
                        cellTemplate: '/Scripts/tasker/app/userTaskGrid/clientNameCellTemplate.html',
                        cellTooltip: function (row, col) {
                            return row.entity.TaskUserNameToolTip;
                        }
                    },
                    {
                        field: 'ToyName',
                        displayName: 'Boat Name',
                        width: '15%',
                        cellTemplate: '/Scripts/tasker/app/userTaskGrid/cellTemplate.html',
                        cellTooltip: function (row, col) {
                            return row.entity.ToyNameToolTip;
                        }
                    },
                    {
                        field: 'ServiceTechDisplayName',
                        displayName: 'Tech Assigned',
                        width: '15%',
                        cellTemplate: '/Scripts/tasker/app/userTaskGrid/cellTemplate.html',
                        cellTooltip: function (row, col) {
                            return row.entity.ServiceTechDisplayNameToolTip;
                        }
                    },
                    {
                        field: 'SubContractorDisplayName', 
                        displayName: 'SubContractor Assigned', width: '15%',
                        cellTemplate: '/Scripts/tasker/app/userTaskGrid/cellTemplate.html',
                        cellClass: 'ui-grid-center-align'
                    }
                    //,
                    // {
                    //     field: '',
                    //     displayName: 'Status',
                    //     width: '15%',
                    //     cellTemplate: '/Scripts/tasker/app/userTaskGrid/cellTemplate.html',
                    //     cellTooltip: function (row, col) {
                    //         return row.entity.CurrentTaskStatusDescriptionList;
                    //     }
                    // },
                    // {
                    //     field: '',
                    //     displayName: 'Deleivery Date',
                    //     width: '15%',
                    //     cellTooltip: function (row, col) {
                    //         return row.entity.BoatDeleiveryDate;
                    //     }
                    // },
                    // {
                    //     field: '', displayName: 'Tech Complete Date',
                    //     visible: false, width: '15%',
                    //     cellClass: 'ui-grid-center-align'
                    // },
                    // {
                    //     field: '', displayName: 'Date Created', visible: false, width: '15%',
                    //     cellClass: 'ui-grid-center-align'
                    // },
                    // {
                    //     field: '', displayName: 'Service Tech Status', visible: false, width: '18%',
                    //     cellClass: 'ui-grid-center-align'
                    // }
                    ],
                    onRegisterApi: function (gridApi) {
                        scope.gridApi = gridApi;
                        scope.gridApi.core.on.sortChanged( scope, scope.sortChanged );
                        scope.sortChanged(scope.gridApi.grid, [ scope.gridOptions.columnDefs[1]]);
                    }
                }
            }
        }
    ]);