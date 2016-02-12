angular.module('myVillages.tasker.app.userTask')
    .factory('userTaskDataServiceDM', ['DM_API_KEY', '$http', '$q',
        function (DM_API_KEY, $http, $q) {
            'use strict';

            var searchWorkOrders = function (dmEndpoint, custId) {
                var deferred = $q.defer();
                $http({
                    method: 'GET',
                    url: dmEndpoint + 'Service/WorkOrders/ListForCustomer',
                    headers: {
                        'IntegratorAppSecret': DM_API_KEY
                    },
                    params: { CustId: custId },
                    cache: true
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.statusText);
                });
                return deferred.promise;
            };

            var getWorkOrderDetails = function (dmEndpoint, workOrderId) {
                var deferred = $q.defer();
                $http({ 
                    method: 'GET', 
                    url: dmEndpoint + 'Service/WorkOrders/Retrieve',
                    headers: {
                            'IntegratorAppSecret': DM_API_KEY
                    },
                    params: { Id: workOrderId, Detail: false }
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.statusText);
                });
                return deferred.promise;
            };

            var saveServiceRequest = function (dmEndpoint, serviceRequestArgs) {
                var deferred = $q.defer();
                $http({ 
                    method: 'POST', 
                    url: dmEndpoint + 'Service/Estimates/Update',
                    headers: {
                            'IntegratorAppSecret': DM_API_KEY
                    },
                    data: serviceRequestArgs
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.statusText);
                });
                return deferred.promise;
            };

            return {
                searchWorkOrders: searchWorkOrders,
                getWorkOrderDetails: getWorkOrderDetails,
                saveServiceRequest: saveServiceRequest
            };
        }
    ]);