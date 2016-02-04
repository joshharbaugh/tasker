(function () {
    'use strict';

    var getGlobalObject = function () {
        return Function('return this')();
    };
    var global = getGlobalObject();

    var defaultMyVillagesObject = {
        TaskerApp: {}
    };
    global.MyVillages = global.MyVillages || defaultMyVillagesObject;
})();