'use strict';

angular.module('myVillages.tasker.app.heartbeat.directives')
    .directive('clientReminders', ['$http', 'API_BASE_URL', 'dataService', '$modal', 'reminderActionKeywords', '$rootScope', function ($http, API_BASE_URL, dataService, $modal, reminderActionKeywords, $rootScope) {
        return {
            restrict: 'A'
            , replace: true
            , scope: {
                vm: '=ngModel'
                , user: '=userData'
            }
            , templateUrl: '/Scripts/tasker/app/heartbeat/clientReminders.html'
            , link: function (scope, elem, attrs) {
                var pulse, initialLoad = true
                scope.client_reminders_status = 'all'
                scope.vm.reminders = false

                scope.$watch('vm.selected_client', function (client) {
                    if (client) {
                        var $parsed = JSON.parse(client)
                        if ($parsed['UserRowId']) getReminders($parsed['UserRowId'], scope.client_reminders_status)
                    }
                }, true)

                $rootScope.$on('event:heartbeatDisabled', function (event, args) {
                    clearInterval(pulse)
                })

                function getReminders(client, status) {
                    if (!status || status === 'all') status = ''
                    scope.isLoading = true
                    $http.get(API_BASE_URL + 'api/userreminders/getonbehalfof/' + client + '/' + status, { ignoreLoadingBar: true })
                        .then(function (result) {
                            scope.vm.reminders = result.data
                            initialLoad = false
                            scope.isLoading = false
                            $rootScope.$broadcast('event:heartbeat')
                            if($rootScope.refreshRate !== 'null') setPulse(client, status)
                        }, function (result) {
                            initialLoad = false
                            scope.isLoading = false
                            if ($rootScope.refreshRate !== 'null') setPulse(client, status)
                            toastr.error(result.statusText)
                            if (console && console.log) console.log(result.data)
                        })
                }

                function setPulse(client, status) {
                    clearInterval(pulse)
                    pulse = setInterval(function () {
                        scope.isLoading = true
                        $http.get(API_BASE_URL + 'api/userreminders/getonbehalfof/' + client + '/' + status, { ignoreLoadingBar: true })
                            .then(function (result) {
                                scope.vm.reminders = result.data
                                scope.isLoading = false
                            }, function (result) {
                                scope.isLoading = false
                                toastr.error(result.statusText)
                                if (console && console.log) console.log(result.data)
                            })
                    }, parseInt($rootScope.refreshRate))
                }

                var snoozeModalCtrl = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                    $scope.ok = function (result) {
                        $modalInstance.close($scope.dt.value);
                    };

                    $scope.cancel = function (result) {
                        $modalInstance.close('cancel');
                    };

                    $scope.today = function () {
                        $scope.dt = {
                            value: new Date()
                        };
                    };
                    $scope.today();

                    $scope.toggleMin = function () {
                        $scope.minDate = new Date();
                    };
                    $scope.toggleMin();

                    $scope.open = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();

                        $scope.opened = {
                            value: true
                        };
                    };
                    $scope.initDate = new Date();
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1
                    };
                }]

                scope.openSnoozeModal = function () {
                    return $modal.open({
                        templateUrl: 'snoozeDateModal.html',
                        controller: snoozeModalCtrl,
                        scope: scope
                    }).result;
                }

                scope.reminderTaskIt = function (reminder) {
                    var isCreatedOnBehalfOfClient = true
                    dataService.update('UserReminders', reminder.RowId + '?actionKeyword=taskit&isCreatedOnBehalfOfClient=' + isCreatedOnBehalfOfClient, {}).then(function (result) {
                        if (result && result.TaskListId) {
                            console.log('result', result)
                            toastr.success('Task successfully created from reminder.')
                            //window.location = '/Tasker/#tasks?taskgroupid=' + result.TaskListId;
                        }
                    })
                }

                scope.reminderSnooze = function (reminder) {
                    reminder.snoozeItDate = new Date();
                    reminder.snoozeItDate.setDate(reminder.snoozeItDate.getDate() + 1)
                    scope.openSnoozeModal().then(function (result) {
                        if (result && result != 'cancel') {
                            reminder.SnoozedUntilDate = result;
                            reminder.ActionKeyword = reminderActionKeywords.SnoozeIt;
                            dataService.update('UserReminders', reminder.RowId, reminder).then(function (result) {
                                toastr.success('Reminder has been snoozed.')
                            });
                        }
                    })
                }

                scope.reminderDismiss = function (reminder) {
                    reminder.ActionKeyword = reminderActionKeywords.DismissIt;
                    dataService.update('UserReminders', '', reminder).then(function (result) {
                        reminder = result;
                        toastr.success('Reminder has been dismissed.')
                    });
                }

                scope.applyStatusFilter = function (filter) {
                    scope.client_reminders_status = filter
                    if (scope.vm.selected_client) {
                        getReminders(JSON.parse(scope.vm.selected_client).UserRowId, scope.client_reminders_status)
                    }
                }
            }
        }
    }])