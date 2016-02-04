'use strict';

angular.module('myVillages.tasker.app.heartbeat')
    .controller('HeartbeatDashboardController', [
        '$scope',
        'authService',
        '$modal',
        '$cookieStore',
        'dataService',
        '$http',
        'API_BASE_URL',
        '$timeout',
        '$rootScope',
        function ($scope, authService, $modal, $cookieStore, dataService, $http, API_BASE_URL, $timeout, $rootScope) {
            var vm = $scope
                , clientsList = []
                , $layout

            // Set initial panel refresh rate (default: 30 seconds)
            $rootScope.refreshRate = '30000';

            $scope.$on('$viewContentLoaded', function () {
                var checkPackeryLoaded = setInterval(function () {
                    try {
                        if ($.fn.packery && window.Draggabilly && !window.isMobile()) {
                            clearInterval(checkPackeryLoaded)
                            $layout = $('#layout').packery({
                                itemSelector: '.panel',
                                percentPosition: true,
                                gutter: 10,
                                isInitLayout: false
                            })

                            $layout.on('dragItemPositioned', function (event, draggedItem) {
                                // manually init (mimick 'snapping')
                                $timeout(function () {
                                    $layout.packery()
                                })
                            })
                            
                            $layout.find('.panel').each(function (i, layoutItem) {
                                var drag = new Draggabilly(layoutItem, {
                                    handle: '.handle'
                                })
                                $layout.packery('bindDraggabillyEvents', drag)

                                $(layoutItem).on('shown.bs.collapse', function () {
                                    // manually init draggable adaptive layout
                                    $timeout(function () {
                                        $layout.packery()
                                    })
                                })

                                $(layoutItem).on('hidden.bs.collapse', function () {
                                    // manually init draggable adaptive layout
                                    $timeout(function () {
                                        $layout.packery()
                                    })
                                })
                            })
                        }
                    } catch (e) {
                        if(console && console.error) console.error(e)
                    }
                }, 100)
            })

            $rootScope.$on('event:heartbeat', function (event, args) {
                // manually init draggable adaptive layout
                if ($.fn.packery && window.Draggabilly && !window.isMobile()) {
                    $timeout(function () {
                        $layout.packery()
                    })
                }
            })
            $rootScope.$watch('refreshRate', function (rate) {
                if (rate && rate == 'null') {
                    $rootScope.$broadcast('event:heartbeatDisabled')
                }
            })

            vm.dashboard = {
                recent_activity: {
                    selected_client: ''
                },
                estimates_requested: {
                    selected_client: ''
                },
                client_reminders: {
                    selected_client: ''
                },
                tech_status_updates: {
                    selected_client: ''
                },
                recent_messages: {
                    selected_client: ''
                },
                rows: [
                    {
                        panels: [
                            {
                                id: 1,
                                name: 'Recent activity'
                            }
                        ]
                    }
                ]
            }

            authService.getCurrentUser()
                .then(function(data) {
                    vm.user = data
                })

            dataService.getAll('contacts', { 'clientsOnly': true })
                .then(function (results) {
                    _.each(_.map(results, function (result) {
                        // map our client objects to smaller versions
                        return {
                            DisplayName: result.DisplayName,
                            EmailAddress: result.EmailAddress,
                            FirstName: result.FirstName,
                            LastName: result.LastName,
                            IsActive: result.IsActive,
                            Toys: result.Toys,
                            UserRowId: result.UserRowId
                        }
                    }), function (result) {
                        // eliminate duplicates
                        if (_.where(clientsList, {UserRowId: result.UserRowId}).length == 0) {
                            clientsList.push(result)
                        }
                    })

                    vm.user.clients = _.uniq(clientsList)
                }, function (err) {
                    if (console && console.log) console.log(err)
                })

            $scope.sendMessage = function () {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'sendMessageModal.html',
                    controller: ['$scope', '$modalInstance', 'mObject',
                        function ($scope, $modalInstance, mObject) {
                            $scope.mObject = mObject

                            $scope.$watch('mObject.client', function (client) {
                                if (client) {
                                    var tasks,
                                        searchArgs = {
                                            TaskUserRowId: client.UserRowId,
                                            AssignedUserId: vm.user.RowId,
                                            SearchType: 2,
                                            ToyRowId: 0
                                        }

                                    $http.get(
                                        API_BASE_URL + 'usertasksbyfolders/search', { params: searchArgs })
                                        .then(function (result) {
                                            var ungrouppedTasksList = _.where(
                                                result.data.UngrouppedTasksList,
                                                {
                                                    AssignedUserRowId: vm.user.RowId,
                                                    UserRowId: client.UserRowId
                                                })
                                            
                                            var groupTasksList = []
                                            _.each(_.filter(
                                                result.data.UserTasksGroupsList,
                                                function (group) {
                                                    return group.GroupTasks.length > 0
                                                }
                                            ), function (group) {
                                                _.map(group.GroupTasks, function (task) {
                                                    if (task.AssignedUserRowId === vm.user.RowId && task.UserRowId === client.UserRowId) {
                                                        groupTasksList.push(task)
                                                    }
                                                })
                                            })

                                            tasks = _.union(
                                                ungrouppedTasksList,
                                                groupTasksList
                                            )
                                            $scope.mObject.tasks = tasks
                                            $scope.mObject.isClientTasksLoading = false
                                        }, function (result) {
                                            toastr.error(result.statusText)
                                            if (console && console.log) console.log(result.data)
                                        })
                                }
                            })

                            $scope.send = function () {
                                var payload = {
                                    Message: $scope.mObject.message,
                                    ParentRowId: $scope.mObject.task.RowId,
                                    ParentType: 1,
                                    VisibleByOwner: true
                                }
                                $http({
                                    method: 'POST',
                                    url: API_BASE_URL + 'usertask/message',
                                    data: payload
                                })
                                .then(function (response) {
                                    $modalInstance.close({ response: response, title: $scope.mObject.task.Title })
                                })                                
                            }

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            }
                        }
                    ],
                    resolve: {
                        mObject: function () {
                            var obj = {
                                message: '',
                                clients: [],
                                client: '',
                                task: '',
                                isClientTasksLoading: true
                            }

                            if (vm.user.clients) {
                                obj.clients = vm.user.clients
                                return obj
                            } else {
                                return dataService.getAll('contacts', { 'clientsOnly': true })
                                    .then(function (results) {
                                        obj.clients = _.uniq(results)
                                        return obj
                                    }, function (err) {
                                        if (console && console.log) console.log(err)
                                        return obj
                                    })
                            }
                        }
                    }
                })

                modalInstance.result.then(function (data) {
                    if (data.response.status === 200 && data.title) {
                        toastr.success('Message successfully added to task titled "' + data.title + '"')
                    }
                })
            }
            
        }
    ])