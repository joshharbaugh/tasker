'use strict'

var $ = require('jQuery')
var xhrSetup = { xhrFields : { withCredentials : true } }

function getAPI() {
    return $.ajax(window.endpoints.api, xhrSetup)
}

function getUser(api) {
    return $.ajax(api.urls.user_url, xhrSetup)
}

function isAdmin(user) {
    return $.ajax(user.self, xhrSetup).then(function(user) {
        return !!user.body.account_permissions.alter_users
    })
}


function isLabsUser(user) {
    var preferences = user && user.body && user.body.preferences
        ;

    return preferences.labs === true
}

function isFlagActive(api, featureFlag) {
    var flagUrl = api.views.feature_flag + '/' + featureFlag
        ;

    return !featureFlag ? $.when(false) : $.ajax(flagUrl, xhrSetup)
                                           .then(function(flag) { return flag.value.active  })

}

module.exports = function iFetchFeatureFlag(config) {
    var deferred = $.Deferred()
        ;

    config = config || {}

    getAPI().then(function(api) {
                return getUser(api).then(function(user) {
                    return $.when(isAdmin(user), isFlagActive(api, config.flag), isLabsUser(user))
                })
            })
            .then(function(admin, flagActive, labsUser) {
                deferred.resolve(((config.admin && admin) || (config.labs && labsUser) || flagActive))
            }, function() {
                deferred.resolve(false)
            })

    return deferred.promise()
}