(function (tk) {
    'use strict';

    tk.linkedMedia = function () {

        var self = Object.create(tk.Entity());
        $.extend(self, {
            RowId:-1,
            RowGuid: '',
            Uri:'',
            ParentName:'',
            UserDisplayName:'',
            UserProfileImag:'', 
            Name:'',
            Description:'',
            LinkedItemTypeId:-1,
            ParentRowId:-1,
            ParentTypeId:-1, 
            IsActive:null,
            IsDeleted:null, 
            CreatedBy:-1,
            LastModBy:-1,
            DateCreated:null, 
            DateLastMod:null,
            Category:'',
            vidlyMediaShortURL:'',
            originalURI:'',
            vidlyMediaStatus:-1,
            vidlyBatchID:'',
            VidlyShortLink:'',
            VidlyMediaID:'',
            VidlyQRCode:'',
            VidlyHtmlEmbed:'',
            VidlyResponsiveEmbed:'',
            VidlyEmailEmbed:'',
            ThumbNailUri:'',
            RelativeLocalUri:''
        });
        return self;
    };
})(MyVillages.TaskerApp);