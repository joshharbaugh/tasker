(function (tk) {
    'use strict';

    tk.UserTaskPart = function () {

        var self = Object.create(tk.Entity());
        $.extend(self, {
            UserTaskRowId: '',
            ServiceTechRowId: '',
            TotalHours: '',
            TotalActualHours: '',
            Estimate: '',
            DateOfAction: '',
            IsApproved: '',
            ApprovedByUserRowId: ''
        });
        return self;
    };
})(MyVillages.TaskerApp);