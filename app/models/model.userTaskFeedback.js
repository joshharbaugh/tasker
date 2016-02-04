(function (tk) {
    'use strict';

    tk.UserTaskFeedback = function () {
        var self = {
            RowId: undefined,
            RowGuid: undefined,
            DateCreated: undefined,
            DateLastMod: undefined,
            CreatedBy: undefined,
            LastModBy: undefined,
            UserTaskRowId: undefined,
            Message: undefined,
            CreatedByDisplayName: undefined,
            LastModByDisplayName: undefined
        };

        return self;
    };

})(MyVillages.TaskerApp);