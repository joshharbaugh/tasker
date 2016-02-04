angular.module('myVillages.tasker.app.userTaskSmartGroup')
    .factory('UserTaskSmartGroupDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
            'use strict';

            var GetSmartGroup = function (id) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'api/userTaskSmartGroup/' + id ).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;

            }

    var AddContactToSmartGroup = function (xref) {
                /* var xref = {
                    RowId: -1,
                    UserTaskSmartGroupId: -1,
                    ContactRowId: -1
                } */
                var deferred = $q.defer();
        $http.post(API_BASE_URL + 'api/userTaskSmartGroup/AddContactToSmartGroup', { params: xref }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };


    var DeleteContactFromSmartGroup = function (xref) {
                var deferred = $q.defer();
        $http.delete(API_BASE_URL + 'api/userTaskSmartGroup/DeleteContactFromSmartGroup', { params: xref }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };


    var AddSubGroupToSmartGroup = function (args) {
                // args are of type ParentIdToChildIdArgs
                var deferred = $q.defer();
        $http.post(API_BASE_URL + 'api/userTaskSmartGroup/AddSubGroupToSmartGroup', { params: args }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

    var RemoveSubGroupFromSmartGroup = function (args) {
                // args are of type ParentIdToChildIdArgs
                var deferred = $q.defer();
                $http.delete(API_BASE_URL + 'userTaskSmartGroup/RemoveSubGroup', { params: args }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

    var PersistUserTaskSmartGroup = function (smartGroup) {
                var deferred = $q.defer();
        $http.post(API_BASE_URL + 'api/userTaskSmartGroup', { params: smartGroup }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var DeleteUserTaskSmartGroup = function (id) {
                var deferred = $q.defer();
        $http.delete(API_BASE_URL + 'api/userTaskSmartGroup', { params: smartGroup }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var UserTaskSmartGroupSearch = function (args) {
                var deferred = $q.defer();
        $http.get(API_BASE_URL + 'api/userTaskSmartGroup', { params: args }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var UserTaskSmartGroupReadAllTasks = function (id) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'api/userTaskSmartGroup/' + id + '/userTasks' ).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var UserTaskSmartGroupReadAllContacts = function (id) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'api/userTaskSmartGroup/' + id + '/contacts' ).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            return {
                GetSmartGroup: GetSmartGroup,
                AddContactToSmartGroup: AddContactToSmartGroup,
                DeleteContactFromSmartGroup: DeleteContactFromSmartGroup,
                AddSubGroupToSmartGroup: AddSubGroupToSmartGroup,
                RemoveSubGroupFromSmartGroup: RemoveSubGroupFromSmartGroup,
                PersistUserTaskSmartGroup: PersistUserTaskSmartGroup,
                DeleteUserTaskSmartGroup: DeleteUserTaskSmartGroup,
                UserTaskSmartGroupSearch: UserTaskSmartGroupSearch,
                UserTaskSmartGroupReadAllTasks: UserTaskSmartGroupReadAllTasks,
                UserTaskSmartGroupReadAllContacts: UserTaskSmartGroupReadAllContacts
            };

            // initialize();

        }
    ]);