angular.module('myVillages.tasker.app.common.services')
    .factory('authService', ['API_BASE_URL', '$http', '$q', '$cookieStore', function (API_BASE_URL, $http, $q, $cookieStore) {
        
        var authInfo = {
            isAuthenticated: false,
            token: '',
            userRowId: -1,
    		userName: '',
    		userCategory: '',
    		isBusinessSupervisor: false,
            businessRowId: -1,
    		userPermissions: ''
        };

        var logout = function logout() {
            authInfo.isAuthenticated = false;
            authInfo.userName = '';
            authInfo.token = '';
            authInfo.userRowId = -1;
            userCategory = '';
            isBusinessSupervisor = false;
            businessRowId = -1;
    		userPermissions = '';
            $cookieStore.put('authInfo', authInfo);
        };

        var isAuthenticated = function isAuthenticated() {
            var authInfo = getAuthInfo();
            return (authInfo && authInfo.isAuthenticated);
        };

        var getCurrentUser = function () {
            return $http.get(API_BASE_URL + "user").then(function (res) {
                return res.data;
            })
        };

        var getAuthInfo = function () {
            return $cookieStore.get('authInfo');
        };

        var setAuthInfo = function (data) {
            authInfo.isAuthenticated = data.isAuthenticated;
            authInfo.token = data.token;
            authInfo.userName = data.userName;
            authInfo.userRowId = data.userRowId;
            authInfo.userDisplayName = data.userDisplayName;
            authInfo.userCategory = data.userCategory;
            authInfo.isBusinessSupervisor = data.isBusinessSupervisor;
            authInfo.businessRowId = data.businessRowId;
            authInfo.dmEndpoint = data.dmEndpoint;
            authInfo.dmTechId = data.dmTechId;
            authInfo.isWorkOrderIntegrationEnabled = data.isWorkOrderIntegrationEnabled;
            authInfo.isAzureServiceBusIntegrationEnabled = data.isAzureServiceBusIntegrationEnabled;
            authInfo.userPermissions = JSON.parse(_.unescape(data.userPermissions));
            $cookieStore.put('authInfo', authInfo);
        };

        return {
            logout: logout,
            isAuthenticated: isAuthenticated,
            getCurrentUser: getCurrentUser,
            getAuthInfo: getAuthInfo,
            setAuthInfo: setAuthInfo
        };
    }]);