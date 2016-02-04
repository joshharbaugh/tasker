(function (tk) {
    'use strict';

    tk.UserTaskSmartGroup = function () {

        var self = Object.create(tk.Entity());
        $.extend(self, {
            UserTaskRowId: '',
            UserRowId: '',
            ParentGroupId: '',
            Title: ''
        });
        return self;
    };
})(MyVillages.TaskerApp);