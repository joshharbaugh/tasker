(function (tk) {
    'use strict';

    tk.UserTaskHour = function () {

        var self = Object.create(tk.Entity());
        $.extend(self, {
            UserTaskRowId: '',
            Name: '',
            Description: '',
            Quantity: '',
            VendorName: '',
            ItemNumber: '',
            Location: ''
        });
        return self;
    };
})(MyVillages.TaskerApp);