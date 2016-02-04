'use strict';
angular.module('myVillages.tasker.app.common.directives')
    .directive('tkBreadcrumb', ['$timeout', 'taskQueue', '$location', function ($timeout, taskQueue, $location) {
        return {
            replace: true,
            templateUrl: '/Scripts/tasker/app/common/partials/breadcrumbs.html',
            link: function (scope) {
                scope.breadcrumbs = [];
                scope.$watch('[taskLists,selectedTaskQueue]', function () {
                    if (!scope.taskLists.isLoading &&
                        scope.taskLists.selectedTasksList &&
                        scope.taskLists.selectedTasksList.Title !== "" &&
                        scope.taskLists.selectedTasksList.Title !== "Tasks") {
                        var crumb;
                        
                        if (typeof scope.taskLists.selectedTasksList === 'object') {
                            if (scope.taskLists.selectedTasksList.Title) {
                                crumb = {
                                    'name': (scope.taskLists.selectedTasksList.IsFolder ? 'Folder' : 'List') + ": " + scope.taskLists.selectedTasksList.Title,
                                    'path': '/Tasker#/tasks?groupId=' + scope.taskLists.selectedTasksList.RowId
                                };
                            } else {
                                crumb = {
                                    'name': (scope.taskLists.selectedTasksList.IsFolder ? 'Folder' : 'List') + ": None",
                                    'path': '/Tasker#/tasks'
                                };
                            }
                        } else {
                            crumb = {
                                'name': (scope.taskLists.selectedTasksList[0].IsFolder ? 'Folder' : 'List') + ": " + scope.taskLists.selectedTasksList[0].Title,
                                'path': '/Tasker#/tasks?groupdId=' + scope.taskLists.selectedTasksList[0].RowId
                            };
                        }
                        
                        if (_.where(scope.breadcrumbs, crumb).length === 0) {
                            scope.breadcrumbs[0] = crumb;
                        }
                        
                    }

                    switch (scope.selectedTaskQueue) {
                        case taskQueue.All:
                            var crumb = {
                                'name': 'Filter: All',
                                'path': ''
                            };
                            if (scope.breadcrumbs.length == 1 && _.where(scope.breadcrumbs, crumb).length === 0 || scope.breadcrumbs.length == 2) {
                                scope.breadcrumbs[1] = crumb;
                            }
                            break;
                        case taskQueue.Open:
                            var crumb = {
                                'name': 'Filter: Open',
                                'path': ''
                            };
                            if (scope.breadcrumbs.length == 1 && _.where(scope.breadcrumbs, crumb).length === 0 || scope.breadcrumbs.length == 2) {
                                scope.breadcrumbs[1] = crumb;
                            }
                            break;
                        case taskQueue.AssignedToMe:
                            var crumb = {
                                'name': 'Filter: Assigned to me',
                                'path': ''
                            };
                            if (scope.breadcrumbs.length == 1 && _.where(scope.breadcrumbs, crumb).length === 0 || scope.breadcrumbs.length == 2) {
                                scope.breadcrumbs[1] = crumb;
                            }
                            break;
                        case taskQueue.SharedWithMe:
                            var crumb = {
                                'name': 'Filter: Shared with me',
                                'path': ''
                            };
                            if (scope.breadcrumbs.length == 1 && _.where(scope.breadcrumbs, crumb).length === 0 || scope.breadcrumbs.length == 2) {
                                scope.breadcrumbs[1] = crumb;
                            }
                            break;
                        case taskQueue.AwaitingApproval:
                            var crumb = {
                                'name': 'Filter: Awaiting approval',
                                'path': ''
                            };
                            if (scope.breadcrumbs.length == 1 && _.where(scope.breadcrumbs, crumb).length === 0 || scope.breadcrumbs.length == 2) {
                                scope.breadcrumbs[1] = crumb;
                            }
                            break;
                        case taskQueue.Completed:
                            var crumb = {
                                'name': 'Filter: Completed',
                                'path': ''
                            };
                            if (scope.breadcrumbs.length == 1 && _.where(scope.breadcrumbs, crumb).length === 0 || scope.breadcrumbs.length == 2) {
                                scope.breadcrumbs[1] = crumb;
                            }
                            break;
                        default:
                    }
                }, true);

                scope.gotoHome = function () {
                    angular.forEach($location.search(), function (v, k) {
                        $location.search(k, null)
                    })
                    scope.$parent.taskLists.selectedTasksList = [];
                    
                    $timeout(function () {
                        scope.$parent.searchUserTasks();
                    }, 1000);
                };                
            }
        };
    }]);