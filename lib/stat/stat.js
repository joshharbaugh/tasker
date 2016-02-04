var exec = require('child_process').exec
var when = require('when')
var nodefn = require('when/node/function')
var func = require('when/function')
var path = require('path')

module.exports =  function stat(){
    'use strict';
    var pkg = require('../../package.json')
    var info = {}
    info.name = pkg.name || '(no-name)'
    info.description = pkg.description
    info.version = pkg.version || '0.0.0'
    info.build = process.env.BUILD_NUMBER || '0'
    info.revision = undefined
    info.branch = undefined
    info.fversion = undefined

    //something like `myproject-1.0.0-mybranch-42-06e3be1`
    function fversion(info) {
        return [
            info.name,
            info.version || '~',
            info.branch || '~',
            info.build || '~',
            info.revision || '~'
        ].join('-')
    }

    function finish(attr) {
        return function(std) {
            var stdout = std[0]
            var stderr = std[1]
            if(stderr) {
                info[attr] = stderr
            } else {
                stdout = (stdout || ('(no-' + attr + ')'))
                info[attr] = stdout.replace('\n','')
            }
            info.fversion = fversion(info)
            return info
        }
    }

    var branch
    //jenkins
    function getBranchFromJenkins(){
        return path.basename(process.env.GIT_BRANCH)
    }
    //jenkins
    if(process.env.GIT_BRANCH) {
        branch = func.call(getBranchFromJenkins)
            .then(function(out){
                info.branch = out
                return info
            })
    } else {
        try {
            branch = nodefn.call(exec,'git symbolic-ref --short -q HEAD')
                .then(finish('branch'))
        } catch(err) {
            throw err
        }
    }

    var revision = nodefn.call(exec,'git rev-parse --short HEAD')
        .then(finish('revision'))

    return when.all([branch,revision]).then(function(they){
            return they[they.length-1]
        },function(err) {
            console.error(err,err.stack)
            throw err
        })
}