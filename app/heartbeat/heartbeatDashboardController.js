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

            $scope.$on('draggable:end', function (evt, obj) {
                var elm = angular.element(obj.element)
                elm.removeClass('drag-enter')
            })
            $scope.$on('dashboard.updated', function (evt, args) {
                if (args.rows && args.rows.length > 0) {
                    // persist the row/panel orientation to localStorage or cookies
                    if (window.localStorage) localStorage.setItem('dashboard.rows', JSON.stringify(args.rows))
                    else $cookieStore.put('dashboard-rows', JSON.stringify(args.rows))
                }
            })

            $rootScope.$watch('refreshRate', function (rate) {
                if (rate && rate == 'null') {
                    $rootScope.$broadcast('event:heartbeatDisabled')
                }
            })

            vm.dashboard = {
                'recent-activity': {
                    selected_client: ''
                },
                'estimates-requested': {
                    selected_client: ''
                },
                'client-reminders': {
                    selected_client: ''
                },
                'tech-status-updates': {
                    selected_client: ''
                },
                'recent-messages': {
                    selected_client: ''
                }
            };

            if (window.localStorage && localStorage.getItem('dashboard.rows')) {
                $layout = JSON.parse(localStorage.getItem('dashboard.rows'))
                vm.dashboard.rows = $layout
            } else {
                if ($cookieStore.get('dashboard-rows')) {
                    // use cookie
                    $layout = JSON.parse($cookieStore.get('dashboard-rows'))
                } else {
                    $layout = [{
                        panels: [{
                            name: 'Recent activity'
                        },
                        {
                            name: 'Recent messages'
                        },
                        {
                            name: 'Estimates requested'
                        },
                        {
                            name: 'Client reminders'
                        },
                        {
                            name: 'Technician status updates'
                        }]
                    }]
                }
                
                vm.dashboard.rows = $layout
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

            $scope.onDropComplete = function (data, row, panel, evt) {
                var indexOfDropped = row.panels.indexOf(data)
                var indexOfDestination = row.panels.indexOf(panel)
                var elm = angular.element(evt.element)

                $timeout(function () {
                    // swap positions
                    row.panels[indexOfDropped] = panel
                    row.panels[indexOfDestination] = data

                    // reset styling
                    elm.removeClass('drag-enter')

                    $scope.$broadcast('dashboard.updated', { rows: vm.dashboard.rows })
                })
            }
            
        }
    ])