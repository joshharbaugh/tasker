angular.module('myVillages.tasker.app.userTaskGrid').
    controller('UserTaskGridController', ['$scope', '$http', '$interval', '$httpBackend', 'uiGridTreeViewConstants', 'uiGridGroupingConstants',
    'authService', '$q', '$routeParams', 'userTaskGridDataService', 'uiGridConstants', 'userTaskGridService',
    function ($scope, $http, $interval, $httpBackend, uiGridTreeViewConstants, uiGridGroupingConstants, authService, $q, $routeParams, userTaskGridDataService, uiGridConstants, userTaskGridService) {
        var that = this;
        that.sortedIndexedTasksAndGroups = [];
        that.filterApplied = false;
        that.filters = [];
        $scope.isSaveIndexEnabled = true;
        $scope.filterMasterData = {
            ToyName: ['Boat Name..'],
            TaskUserName: ['Client Name..'],
            ServiceTechDisplayName: ['Tech Name..'],
            CurrentTaskStatusDescription: ['Status..']
        };

        var loadUserTasksGrid = function () {
            userTaskGridService.getSortedTasksAndGroups($scope).then(function(sortedTasksAndGroups){
                that.sortedIndexedTasksAndGroups = sortedTasksAndGroups;
                $scope.gridOptions.data = that.sortedIndexedTasksAndGroups;
            });
            $scope.boatNameSelect = 'Boat Name..';
            $scope.clientNameSelect = 'Client Name..';
            $scope.serviceTechSelect = 'Tech Name..';
            $scope.statusSelect = 'Status..';
        };

        var applyFilterGridData = function (filters) {
            filters.forEach(function (filter) {
                var filterByList = filter.filterBy + 'List';
                $scope.gridOptions.data = _.filter((that.filterApplied == true ? $scope.gridOptions.data : that.sortedIndexedTasksAndGroups),
                    function (entity) {
                        if (typeof entity[filter.filterBy] == 'string' &&
                            entity[filter.filterBy] == filter.value) {
                            return entity;
                        } else if (entity[filterByList]
                            && entity[filterByList].length > 1) {
                            if (_.indexOf(entity[filterByList], filter.value) > 0) {
                                return entity;
                            }
                        }
                    });
                that.filterApplied = true;
            });
        }

        $scope.clearFilter = function (value, filterBy) {
            $scope.boatNameSelect = 'Boat Name..';
            $scope.clientNameSelect = 'Client Name..';
            $scope.serviceTechSelect = 'Tech Name..';
            $scope.statusSelect = 'Status..';
            that.filters = [];
            $scope.gridOptions.data = that.sortedIndexedTasksAndGroups;
        }

        $scope.filterGridData = function (value, filterBy) {
            that.filters = _.filter(that.filters, function (filter) {
                return filter.filterBy !== filterBy;
            });
            var filterExist = _.where(that.filters, { 'filterBy': filterBy });
            if (value !== 'Boat Name..' &&
                value !== 'Client Name..' &&
                value !== 'Tech Name..' &&
                value !== 'Status..') {
                if (filterExist.length == 0) {
                    that.filters.push({ 'value': value, 'filterBy': filterBy });
                }
            } else {
                that.filters = _.filter(that.filters, function (filter) {
                    return filter.filterBy !== filterBy;
                })
            }
            that.filterApplied = false;
            if (that.filters.length > 0) {
                applyFilterGridData(that.filters);
            } else {
                $scope.gridOptions.data = that.sortedIndexedTasksAndGroups;
            }
        };

        $scope.showAllTasksLink = function (taskList) {
            if (!taskList.isTask && taskList.hasTasks) {
                return true;
            } else {
                return false;
            }
        };

        $scope.resetGrouping = function () {
            $scope.gridApi.grouping.clearGrouping();
        };

        $scope.saveRowIndexing = function () {
            userTaskGridService.saveRowIndexing($scope);
        };

        var sortByToyName = function(item){
            return item.ToyName;
        };

        $scope.sortChanged = function(grid, sortColumns) {
            if(_.isUndefined(sortColumns[0])){
                $scope.gridOptions.data = that.sortedIndexedTasksAndGroups;
                $scope.isSaveIndexEnabled = true;
                return;
            }
            if(_.isUndefined(sortColumns[0].sort)){
                return;
            }
            var sortedTasksAndGroups = [];
            switch(sortColumns[0].sort.direction) {
                case uiGridConstants.ASC:
                    sortedTasksAndGroups = _.sortBy(that.sortedIndexedTasksAndGroups, sortColumns[0].field);
                    break;
                case uiGridConstants.DESC:
                    sortedTasksAndGroups = _.sortBy(that.sortedIndexedTasksAndGroups, sortColumns[0].field).reverse();
                    break;
                default:
                    sortedTasksAndGroups = that.sortedIndexedTasksAndGroups;
                    break;
            }
            $scope.gridOptions.data = sortedTasksAndGroups;
            $scope.isSaveIndexEnabled = false;
        };
        $scope.gridOptions = userTaskGridService.getUserTaskGridOptions($scope);
        loadUserTasksGrid();

    }]);

