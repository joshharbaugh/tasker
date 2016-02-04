angular.module('myVillages.tasker.app.linkedMedia')
    .directive('tkLinkedMedia', [function () {
    	return {
    		restrict: 'E',
    		scope: {
    			userTaskRowId: '=',
    			userTaskRowGuid: '='
    		},
    		templateUrl: '/Scripts/tasker/app/linkedMedia/linkedMedia.html',
    		controller: ['$scope', '$sce', '$modal', 'linkedMediaDataService', '$upload', '$timeout', 'API_BASE_URL',
				function ($scope, $sce, $modal, linkedMediaDataService, $upload, $timeout, API_BASE_URL) {

					var checkInterval;
					$scope.pendingVidlyEncoding = [];
					$scope.isSampleTaskLinkedMedia = false;
					$scope.viewingUserRowId = parseInt($scope.$parent.$parent.viewingUserRowId);

					function getTaskLinkedMedia(RowId) {
					    if (!RowId && !$scope.userTaskRowId) {
					        $scope.isSampleTaskLinkedMedia = true;
					        $scope.linkedMedia = [
                                {
                                    Category: null,
                                    CategoryDisplay: "",
                                    CreatedBy: 0,
                                    DateCreated: "2016-01-11T20:02:53.503",
                                    DateCreatedDisplay: "01/11/2016",
                                    DateLastMod: "2016-01-11T20:02:53.503",
                                    Description: "Sample linked media image",
                                    FileTypeIcon: "",
                                    IsActive: true,
                                    IsDeleted: false,
                                    IsPrivate: false,
                                    IsShowPrivate: true,
                                    IsShowVisibleByOwner: false,
                                    IsShowVisibleByPro: false,
                                    IsShowVisibleBySubcontractor: false,
                                    IsVisibleByOwner: true,
                                    IsVisibleByPro: false,
                                    IsVisibleBySubcontractor: false,
                                    LastModBy: 0,
                                    LinkedItemTypeId: 2,
                                    LinkedTargetRowId: 0,
                                    MediaTypeDisplay: "Image",
                                    Name: "f48aae27-3e3b-4b6c-be22-37be25429816.jpg",
                                    NameShortened: "f48aae27-3e3b-4b6c-be22-37be25...",
                                    ParentName: "Sample User Task (demo)",
                                    ParentRowId: null,
                                    ParentTypeId: 19,
                                    RelativeLocalUri: null,
                                    RowGuid: "f48aae27-3e3b-4b6c-be22-37be25429816",
                                    RowId: 0,
                                    SubcontractorRowId: null,
                                    ThumbNailUri: null,
                                    TypeDisplay: "Guideline Step",
                                    Uri: "/Images/Engine-HiRes.jpg",
                                    //Uri: "/Common/Download?id=j%2fGY7KyV6s3aaFlcyCtYjGcIuB1rVafwkGtXDAAiUQuHm8IHGqeuY6%2bO6t9saNejIwOJvrKgjpOienhixRO0PZgTr%2bCd6dr7K85fYpE4UbPu8VgoO4TAbv8KmQcvHntJrneDWaVeGNz9GFHOzAzOKGzpFc03zsW4z%2b5ptFI4Tfy4JFbssRt7xBc32QIiH5iI",
                                    UserDisplayName: "Sample User",
                                    UserProfileImage: null,
                                    VidlyEmailEmbed: null,
                                    VidlyHtmlEmbed: null,
                                    VidlyMediaID: null,
                                    VidlyQRCode: null,
                                    VidlyResponsiveEmbed: null,
                                    VidlyShortLink: null,
                                    VidlySourceFile: "",
                                    active: true,
                                    originalURI: null,
                                    vidlyBatchID: null,
                                    vidlyMediaShortURL: null,
                                    vidlyMediaStatus: null
                                }
					        ];
					        MagicThumb.refresh();
					        return;
					    } else {
					        var searchArgs = {
					            RowId: RowId,
					            IsActive: true,
					            IsDeleted: false,
					            Name: '',
					            NameStartsWith: false,
					            Keyword: '',
					            IncludeFiles: true,
					            IncludeImages: true,
					            IncludeVideos: true,
					            IncludeComments: false,
					            ParentTaskType: $scope.$parent.$parent.userTask.TaskTypeToken,
					            CreatedById: -1,
					            ParentTypeId: 19, // 19 LinkedParentType.USERTASK
					            ParentRowId: $scope.userTaskRowId,
					            SubcontractorRowId: $scope.$parent.$parent.userTask.SubcontractorRowId,
					        };
					        linkedMediaDataService.getTaskLinkedMedia(searchArgs).then(function (result) {
					            $scope.linkedMedia = result;
					            MagicThumb.refresh();
					        });
					    }						
					};

					function addLinkedMedia() {
						if ($scope.$parent.$parent.$parent.isPremiumFeature($scope.$parent.$parent.userTask.TaskTypeToken)) { return false; }
						$scope.uploadCounter = 0;
						$.each($scope.uploadFiles, function () {
							var file = this;
							generateThumb(file);
							var documentUploadData = {
								FileUploadParentTypeId: 19,
								FileUploadParentType: 'USERTASK',
								FileUploadParentObjectGuid: $scope.userTaskRowGuid,
								FileUploadParentRowId: $scope.userTaskRowId,
								description: file.name,
								IsVisibleByOwner: !($scope.$parent.$parent.isServiceTechTask || $scope.$parent.$parent.isSubcontractorTask),
								IsVisibleByPro: $scope.$parent.$parent.isUserTask || $scope.$parent.$parent.isClientTask || ($scope.$parent.$parent.isServiceTechTask && $scope.$parent.$parent.userTask.SubcontractorRowId == undefined),
								IsVisibleBySubcontractor: $scope.$parent.$parent.userTask.SubcontractorRowId > 0 ? true : false,
								SubcontractorRowId: $scope.$parent.$parent.userTask.SubcontractorRowId,
								IsActive: true
							};
							file.upload = $upload.upload({
								url: API_BASE_URL + 'addmedia',
								data: documentUploadData,
								file: file
							}).progress(function (evt) {
								file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
							}).error(function () {
								$scope.uploadCounter++;
							}).success(function (data, status, headers, config) {
								console.log('file ' + config.file.name + ' is uploaded successfully');
								$scope.uploadCounter++;
								if ($scope.uploadCounter == $scope.uploadFiles.length) {
									$scope.uploadFiles = [];
									getTaskLinkedMedia();
								}
							});
						});
					};

					function updateDescription(slide, description) {
						if ($scope.$parent.$parent.$parent.isPremiumFeature($scope.$parent.$parent.userTask.TaskTypeToken)) { return false; }
						linkedMediaDataService.getLinkedMedia(slide.RowId).then(function (result) {
							result.Description = description;
							linkedMediaDataService.updateDescription(result).then(function (result) {
								slide.Description = result.Description;
								toastr.success('Media description has been updated');
							});
						});
						return false;
					};

					function toggleVisibility(slide, chk) {
						linkedMediaDataService.getLinkedMedia(slide.RowId).then(function (result) {
							result.IsPrivate = chk == "private" ? slide.IsPrivate : result.IsPrivate;
							result.IsVisibleByOwner = chk == "visibleByPro" ? false : chk == "visibleByOwner" ? slide.IsVisibleByOwner : result.IsVisibleByOwner;
							result.IsVisibleBySubcontractor = chk == "private" ? false : chk == "visibleBySubcontractor" ? slide.IsVisibleBySubcontractor : result.IsVisibleBySubcontractor;
							result.IsVisibleByPro = chk == "visibleByPro" ? slide.IsVisibleByPro : result.IsVisibleByPro;
							linkedMediaDataService.updateDescription(result).then(function (result) {
								toastr.success('Media visibility has been updated');
							});
						});
					};

					function deleteLinkedMedia(id) {
						if ($scope.$parent.$parent.$parent.isPremiumFeature($scope.$parent.$parent.userTask.TaskTypeToken)) { return false; }
						linkedMediaDataService.deleteLinkedMedia(id).then(function (result) {
							getTaskLinkedMedia();
						});
						return false;
					};

					function downloadMedia(uri) {
						location.href = uri;
					};

					function renderHtml(slide) {
						if (slide.active && !slide.loaded) {
							slide.loaded = true;
							if (slide.vidlyMediaStatus < 6) {
								$scope.renderedHtml = $sce.trustAsHtml('<span class="alert alert-warning" style="margin: auto; width: 75%;">Video upload is being processed.</span>');
							}
							if (slide.vidlyMediaStatus === 6 && slide.VidlyEmailEmbed) {
								var html_code = angular.element(slide.VidlyEmailEmbed);
								angular.element(html_code).removeAttr('width');
								angular.element(html_code).attr('height', '320');
								$scope.renderedHtml = $sce.trustAsHtml(html_code.get()[0].outerHTML);
							}
							if (slide.vidlyMediaStatus === 7) {
								$scope.renderedHtml = $sce.trustAsHtml('<span class="alert alert-danger" style="margin: auto; width: 75%;">Error! There was a problem loading your video for playback.</span>');
							}
						}
					};

					function uploadAbort(file) {
						file.upload.abort();
						file.upload.aborted = true;
						$scope.uploadCounter++;
						if ($scope.uploadCounter == $scope.uploadFiles.length) {
							$scope.uploadFiles = [];
							getTaskLinkedMedia();
						}
					};

					function generateThumb(file) {
						if (file != null) {
							if (file.type.indexOf('image') > -1) {
								$timeout(function () {
									var fileReader = new FileReader();
									fileReader.readAsDataURL(file);
									fileReader.onload = function (e) {
										$timeout(function () {
											file.dataUrl = e.target.result;
										});
									}
								});
							}
						}
					};

					function isCheckboxVisible(chk) {
						var isVisible = false;
						switch (chk) {
							case "private":
								isVisible = $scope.$parent.$parent.isUserTask;
								break;
							case "visibleByOwner":
							case "visibleBySubcontractor":
								isVisible = $scope.$parent.$parent.isClientTask;
								break;
							case "visibleByPro":
								isVisible = $scope.$parent.$parent.isSubcontractorTask;
								break;
						}
						return isVisible;
					};

					$scope.$watch('linkedMedia', function (media) {
						if (media.length > 0) {
							angular.forEach(media, function (linkedmedia) {
								if (linkedmedia.LinkedItemTypeId === 3 && linkedmedia.vidlyMediaStatus < 6) {
									// add to queue for status recheck
									if ($scope.pendingVidlyEncoding.indexOf(linkedmedia.RowId) === -1) {
										$scope.pendingVidlyEncoding.push(linkedmedia.RowId);
									}
								}
							});
						}
					});

					$scope.$watch('pendingVidlyEncoding', function (pendingEncodings) {
						if (pendingEncodings && pendingEncodings.length > 0) {
							clearTimeout(checkInterval);
							checkInterval = setTimeout(function () {
								angular.forEach(pendingEncodings, function (RowId, index) {
									$scope.pendingVidlyEncoding.splice(index, 1);
									getTaskLinkedMedia();
								});
							}, 3e4);
						}
					}, true);

					angular.extend($scope, {
						slides: [],
						linkedMedia: [],
						uploadFiles: [],
						uploadCounter: 0,
						getTaskLinkedMedia: getTaskLinkedMedia,
						addLinkedMedia: addLinkedMedia,
						deleteLinkedMedia: deleteLinkedMedia,
						updateDescription: updateDescription,
						uploadAbort: uploadAbort,
						renderHtml: renderHtml,
						generateThumb: generateThumb,
						isPermission: true,
						isCheckboxVisible: isCheckboxVisible,
						toggleVisibility: toggleVisibility
					});
				}],
    		link: function (scope, element, attrs, ctrl) {
    			scope.$parent.$parent.$watch('isCollapsed', function (isCollapsed) {
    				if (!isCollapsed) {
    					scope.getTaskLinkedMedia();
    				}
    			});
    			scope.isPermission = scope.$parent.$parent.$parent.isPermission('LinkedMedia', scope.$parent.$parent.userTask.TaskTypeToken, scope.$parent.$parent.userTask.UserRowId);
    		}
    	};
    }])
	.directive('disableNgAnimate', ['$animate',
		function ($animate) {
			return {
				restrict: 'A',
				link: function (scope, element) {
					$animate.enabled(false, element);
				}
			};
		}
	]);

