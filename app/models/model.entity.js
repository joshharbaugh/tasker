(function (tk) {
    'use strict';

    tk.Entity = function () {
        var self = {
            RowId: undefined,
            RowGuid: undefined,
            DateCreated: undefined,
            DateLastMod: undefined,
            CreatedBy: undefined,
            LastModBy: undefined,
            IsActive: 1,
            IsDeleted: 0
        };

        return self;
    };

})(MyVillages.TaskerApp);