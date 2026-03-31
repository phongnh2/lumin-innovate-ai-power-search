export class OperationLimitConstants {
  public static readonly FIND_USER = 'findUser';

  public static readonly UPDATE_SETTING = 'updateSetting';

  public static readonly EDIT_USER = 'editUser';

  public static readonly EDIT_USER_PURPOSE = 'editUserPurpose';

  public static readonly REMOVE_AVATAR = 'removeAvatar';

  public static readonly SEEN_NEW_NOTIFICATIONS_TAB = 'seenNewNotificationsTab';

  public static readonly CHANGE_PASSWORD = 'changePassword';

  public static readonly DELETE_ACCOUNT = 'deleteAccount';

  public static readonly DELETE_SIGNATURE_BY_INDEX = 'deleteSignatureByIndex';

  public static readonly DELETE_SIGNATURE_BY_REMOTE_ID = 'deleteSignatureByRemoteId';

  public static readonly GET_USER_PLAN_STATUS = 'getUserPlanStatus';

  public static readonly CREATE_OWN_TEAM = 'createOwnTeam';

  public static readonly CREATE_DEFAULT_TEAM = 'createDefaultTeam';

  public static readonly TEAM = 'team';

  public static readonly FORCE_LOGOUT = 'forceLogout';

  public static readonly VERIFY_TOKEN = 'verifyToken';

  public static readonly ADMIN_VERIFY_TOKEN = 'adminVerifyToken';

  public static readonly VERIFY_PASSWORD = 'verifyPassword';

  public static readonly CHECK_LOGIN_EXTERNAL = 'checkLoginExternal';

  public static readonly UPDATE_USER_TYPE = 'updateUserType';

  public static readonly SUBSCRIPTION = 'subscription';

  public static readonly GET_UNIFY_SUBSCRIPTION = 'getUnifySubscription';

  public static readonly UPCOMING_INVOICE = 'upcomingInvoice';

  public static readonly CREATE_SUBSCRIPTION = 'createSubscription';

  public static readonly INVOICES = 'invoices';

  public static readonly CANCEL_SUBSCRIPTION = 'cancelSubscription';

  public static readonly CANCEL_UNIFY_SUBSCRIPTION = 'cancelUnifySubscription';

  public static readonly REACTIVE_SUBSCRIPTION = 'reactiveSubscription';

  public static readonly COUPON_VALUE = 'couponValue';

  public static readonly GET_SUBSCRIPTION_COUPON = 'getSubscriptionCoupon';

  public static readonly CREATE_FREE_TRIAL_SUBSCRIPTION = 'createFreeTrialSubscription';

  public static readonly CREATE_FREE_TRIAL_UNIFY_SUBSCRIPTION = 'createFreeTrialUnifySubscription';

  public static readonly GET_BILLING_EMAIL = 'getBillingEmail';

  public static readonly GET_REMAINING_PLAN = 'getRemainingPlan';

  public static readonly RENAME_DOCUMENT = 'renameDocument';

  public static readonly UPDATE_THUMBNAIL = 'updateThumbnail';

  public static readonly GET_DOCUMENT_BY_REMOTE_ID = 'getDocumentByRemoteId';

  public static readonly DELETE_DOCUMENT = 'deleteDocument';

  public static readonly CREATE_DOCUMENT_PERMISSION = 'createDocumentPermission';

  public static readonly CREATE_DOCUMENTS = 'createDocuments';

  public static readonly REQUEST_ACCESS_DOCUMENT = 'requestAccessDocument';

  public static readonly SHARE_DOCUMENT = 'shareDocument';

  public static readonly UPDATE_DOCUMENT_PERMISSION = 'updateDocumentPermission';

  public static readonly REMOVE_DOCUMENT_PERMISSION = 'removeDocumentPermission';

  public static readonly UPDATE_BOOKMARKS = 'updateBookmarks';

  public static readonly DOCUMENT = 'document';

  public static readonly GET_DOCUMENT_BY_ID = 'getDocumentById';

  public static readonly UPDATE_SHARE_SETTING = 'updateShareSetting';

  public static readonly GET_DOCUMENTS = 'getDocuments';

  public static readonly STAR_DOCUMENT = 'starDocument';

  public static readonly UPDATE_MIMETYPE = 'updateMimeType';

  public static readonly CREATE_PDF_FORM = 'createPDFForm';

  public static readonly ACCEPT_REQUEST_ACCESS_DOCUMENT = 'acceptRequestAccessDocument';

  public static readonly REJECT_REQUEST_ACCESS_DOCUMENT = 'rejectRequestAccessDocument';

  public static readonly GET_REQUEST_ACCESS_DOCS_LIST = 'getRequestAccessDocsList';

  public static readonly OPEN_DOCUMENT = 'openDocument';

  public static readonly MEMBERSHIPS = 'memberships';

  public static readonly MEMBERSHIPS_COUNT = 'membershipsCount';

  public static readonly READ_NOTIFICATIONS = 'readNotifications';

  public static readonly READ_ALL_NOTIFICATIONS = 'readAllNotifications';

  public static readonly NOTIFICATIONS = 'notifications';

  public static readonly WIDGET_NOTIFICATION = 'widgetNotifications';

  public static readonly CREATE_WIDGET_NOTIFICATION = 'createWidgetNotification';

  public static readonly DISMISS_WIDGET_NOTIFICATION = 'dismissWidgetNotification';

  public static readonly PREVIEWED_WIDGET_NOTIFICATION = 'previewWidgetNotification';

  public static readonly PREVIEW_ALL_WIDGET_NOTIFICATIONS = 'previewAllWidgetNotifications';

  public static readonly DISMISS_ALL_WIDGET_NOTIFICATION = 'dismissAllWidgetNotifications';

  public static readonly CREATE_QUESTION = 'createQuestion';

  public static readonly UPSERT_FOLLOWING_QUESTION = 'upsertFollowingQuestion';

  public static readonly UPDATE_QUESTION = 'updateQuestion';

  public static readonly DELETE_QUESTION = 'deleteQuestion';

  public static readonly SIGN_UP = 'signUp';

  public static readonly SIGN_UP_WITH_INVITE = 'signUpWithInvite';

  public static readonly ADMIN_SIGN_IN = 'adminSignIn';

  public static readonly SIGN_IN = 'signIn';

  public static readonly SIGN_IN_BY_GOOGLE = 'signInByGoogle';

  public static readonly VERIFY_EMAIL = 'verifyEmail';

  public static readonly RESEND_VERIFY_EMAIL = 'resendVerifyEmail';

  public static readonly SIGN_IN_BY_DROPBOX = 'signInByDropbox';

  public static readonly SIGN_IN_BY_APPLE = 'signInByApple';

  public static readonly FORGOT_PASSWORD = 'forgotPassword';

  public static readonly ADMIN_FORGOT_PASSWORD = 'adminForgotPassword';

  public static readonly RESET_PASSWORD = 'resetPassword';

  public static readonly ADMIN_RESET_PASSWORD = 'adminResetPassword';

  public static readonly SIGN_OUT = 'signOut';

  public static readonly ADMIN_SIGN_OUT = 'adminSignOut';

  public static readonly ADMIN_CREATE_PASSWORD = 'adminCreatePassword';

  public static readonly GET_LANDING_PAGE_TOKEN = 'getLandingPageToken';

  public static readonly VERIFY_SHARING_DOCUMENT_TOKEN = 'verifySharingDocumentToken';

  public static readonly TEAMS_UPLOAD = 'teams/upload';

  public static readonly TEAMS_REMOVE = 'teams/remove';

  public static readonly USER_UPLOAD_FILE = 'user/upload';

  public static readonly USER_GET_AVATAR = 'user/getAvatar';

  public static readonly USER_GET_SIGNATURE = 'user/getSignature';

  public static readonly EMAIL_UPLOAD = 'email/upload';

  public static readonly EMAIL_DELETE = 'email/delete';

  public static readonly DOCUMENT_UPLOAD_THUMBNAIL = 'document/upload-thumbnail';

  public static readonly DOCUMENT_UPLOAD_THUMBNAIL_V2 = 'document/v2/upload-thumbnail';

  public static readonly DOCUMENT_UPLOAD = 'document/upload';

  public static readonly DOCUMENT_UPLOAD_V2 = 'document/v2/upload';

  public static readonly GET_REFRESH_TOKEN = 'auth/get-refresh-token';

  public static readonly DOCUMENT_MOVE_FILE = 'document/movefile';

  public static readonly DOCUMENT_SYNC_FILE_S3 = 'document/sync-file-s3';

  public static readonly DOCUMENT_SYNC_FILE_S3_V2 = 'document/v2/sync-file-s3';

  public static readonly BACKUP_DOCUMENT_V2 = 'document/v2/backup-document';

  public static readonly DOCUMENT_UPLOAD_TO_BANANASIGN = 'document/upload-to-bananasign';

  public static readonly DOCUMENT_GET_SIGNED_URL = 'document/getSignedUrl';

  public static readonly DOCUMENT_GET_DOCUMENT = 'document/getdocument';

  public static readonly COMMUNITY_QUESTION_UPLOAD_FILE_QUESTION = 'communityquestion/upload-file-question';

  public static readonly GET_EVENTS_BY_USER_ID = 'getEventsByUserId';

  public static readonly GET_EVENTS_BY_TEAM_ID = 'getEventsByTeamId';

  public static readonly DELETE_PERSONAL_EVENTS = 'deletePersonalEvents';

  public static readonly GET_PERSONAL_DOCUMENT_SUMMARY = 'getPersonalDocumentSummary';

  public static readonly GET_TEAM_DOCUMENT_SUMMARY = 'getTeamDocumentSummary';

  public static readonly GET_ADMIN_EVENTS = 'getAdminEvents';

  public static readonly CREATE_ANSWER = 'createAnswer';

  public static readonly GET_ANSWERS_BY_QUESTION_ID = 'getAnswersByQuestionId';

  public static readonly GET_ANSWER_WITH_PAGINATION = 'getAnswerWithPagination';

  public static readonly GET_ALL_QUESTIONS = 'getAllQuestions';

  public static readonly GET_QUESTION_BY_ID = 'getQuestionById';

  public static readonly GET_RELATED_QUESTIONS = 'getRelatedQuestions';

  public static readonly SEARCH_QUESTIONS = 'searchQuestions';

  public static readonly HIDE_RATING_MODAL = 'hideRatingModal';

  public static readonly MOVE_DOCUMENTS = 'moveDocuments';

  public static readonly SAVE_AUTO_SYNC_TRIAL = 'saveAutoSyncTrial';

  public static readonly SAVE_AB_SIGNATURE_HUBSPOT = 'saveAbSignatureHubspot';

  public static readonly GET_USER_ROLE_IN_ORG = 'getUserRoleInOrg';

  public static readonly CREATE_ORGANIZATION_DOCUMENT_FORM = 'createOrganizationDocumentForm';

  public static readonly GET_ORGANIZATION_BY_URL = 'getOrganizationByUrl';

  public static readonly GET_ORGANIZATION_BY_ID = 'getOrganizationById';

  public static readonly GET_MEMBER_OF_ORGANIZATION = 'getMemberOfOrganization';

  public static readonly GET_TOTAL_MEMBERS = 'getTotalMembers';

  public static readonly GET_ORG_TEAMS = 'getOrgTeams';

  public static readonly GET_LIST_REQUEST_JOIN_ORGANIZATION = 'getListRequestJoinOrganization';

  public static readonly GET_LIST_PENDING_USER_ORGANIZATION = 'getListPendingUserOrganization';

  public static readonly LEAVE_ORGANIZATION = 'leaveOrganization';

  public static readonly GET_ORGANIZATION_DOCUMENTS = 'getOrganizationDocuments';

  public static readonly CHECK_ORGANIZATION_TRANSFERING = 'checkOrganizationTransfering';

  public static readonly CREATE_ORGANIZATION_TEAM = 'createOrganizationTeam';

  public static readonly GET_RECENT_NEW_ORG_MEMBERS = 'getRecentNewOrgMembers';

  public static readonly UPDATE_GOOGLE_SIGN_IN_SECURITY = 'updateGoogleSignInSecurity';

  public static readonly INVITE_MEMBER_TO_ORGANIZATION = 'inviteMemberToOrganization';

  public static readonly INVITE_MEMBER_TO_ORGANIZATION_ADD_DOC_STACK = 'inviteMemberToOrganizationAddDocStack';

  public static readonly DELETE_PENDING_INVITE = 'deletePendingInvite';

  public static readonly DELETE_MEMBER_IN_ORGANIZATION = 'deleteMemberInOrganization';

  public static readonly CHANGE_PROFILE_ORGANIZATION = 'changeProfileOrganization';

  public static readonly REMOVE_AVATAR_ORGANIZATION = 'removeAvatarOrganization';

  public static readonly CHANGE_AVATAR_ORGANIZATION = 'changeAvatarOrganization';

  public static readonly SET_AVATAR_ORGANIZATION_SUGGESTION = 'setAvatarOrganizationSuggestion';

  public static readonly SET_AVATAR_FROM_SUGGESTION = 'setAvatarFromSuggestion';

  public static readonly SET_ORGANIZATION_MEMBERS_ROLE = 'setOrganizationMembersRole';

  public static readonly ACCEPT_REQUESTING_ACCESS_ORGANIZATION = 'acceptRequestingAccessOrganization';

  public static readonly REJECT_REQUESTING_ACCESS_ORGANIZATION = 'rejectRequestingAccessOrganization';

  public static readonly EXPORT_DOMAIN_DATA = 'exportDomainData';

  public static readonly GET_ORGANIZATION_INSIGHT = 'getOrganizationInsight';

  public static readonly SCHEDULE_DELETE_ORGANIZATION = 'scheduleDeleteOrganization';

  public static readonly GET_ORGANIZATION_PRICE = 'getOrganizationPrice';

  public static readonly CREATE_SUBSCRIPTION_IN_ORGANIZATION = 'createSubscriptionInOrganization';

  public static readonly CREATE_UNIFY_SUBSCRIPTION_IN_ORGANIZATION = 'createUnifySubscriptionInOrganization';

  public static readonly UPGRADE_ORGANIZATION_SUBCRIPTION = 'upgradeOrganizationSubcription';

  public static readonly UPGRADE_UNIFY_SUBCRIPTION_IN_ORGANIZATION = 'upgradeUnifySubscriptionInOrganization';

  public static readonly REACTIVE_ORGANIZATION = 'reactiveOrganization';

  public static readonly REACTIVE_ORGANIZATION_SUBSCRIPTION = 'reactiveOrganizationSubscription';

  public static readonly REACTIVATE_UNIFY_ORGANIZATION_SUBSCRIPTION = 'reactivateUnifyOrganizationSubscription';

  public static readonly FORCE_RESET_ORG_MEMBER_PASSWORD = 'forceResetOrgMemberPassword';

  public static readonly ORGS_OF_USER = 'orgsOfUser';

  public static readonly CONFIRM_ORGANIZATION_ADMIN_TRANSFER = 'confirmOrganizationAdminTransfer';

  public static readonly CREATE_ORGANIZATION = 'createOrganization';

  public static readonly CHECK_MAIN_ORG_CREATION_ABILITY = 'checkMainOrgCreationAbility';

  public static readonly GET_MAIN_ORGANIZATION_CAN_JOIN = 'getMainOrganizationCanJoin';

  public static readonly REQUEST_JOIN_ORGANIZATION = 'requestJoinOrganization';

  public static readonly JOIN_ORGANIZATION = 'joinOrganization';

  public static readonly GET_TEAMS_OF_TEAM_ADMIN = 'getTeamsOfTeamAdmin';

  public static readonly GET_MEMBERS_OF_TEAM = 'getMembersOfTeam';

  public static readonly TRANSFER_LIST_TEAM_OWNERSHIP = 'transferListTeamOwnership';

  public static readonly DELETE_MULTIPLE_DOCUMENT = 'deleteMultipleDocument';

  public static readonly GET_PDF_INFO = 'getPDFInfo';

  public static readonly GET_FORM_LIST = 'getFormList';

  public static readonly GET_SHARE_INVITE_BY_EMAIL_LIST = 'getShareInviteByEmailList';

  public static readonly GET_MENTION_LIST_DOCUMENT_ORG_BY_ID = 'getMentionListDocumentOrgById';

  public static readonly GET_MEMBERS_BY_DOCUMENT_ID = 'getMembersByDocumentId';

  public static readonly GET_MANIPULATION_DOCUMENT = 'getManipulationDocument';

  public static readonly LEAVE_ORG_TEAM = 'leaveOrgTeam';

  public static readonly UPLOAD_DOCUMENT_TO_ORGANIZATION = 'uploadDocumentToOrganization';

  public static readonly UPLOAD_DOCUMENT_TO_ORGANIZATION_V2 = 'uploadDocumentToOrganizationV2';

  public static readonly UPLOAD_DOCUMENT_TO_ORG_TEAM = 'uploadDocumentToOrgTeam';

  public static readonly UPLOAD_DOCUMENT_TO_ORG_TEAM_V2 = 'uploadDocumentToOrgTeamV2';

  public static readonly GET_TEAM_AND_ORGANIZATION_OWNER = 'getTeamAndOrganizationOwner';

  public static readonly UPDATE_USER_DATA = 'updateUserData';

  public static readonly REACTIVATE_USER = 'reactivateUser';

  public static readonly GET_BILLING_WARNING = 'getBillingWarning';

  public static readonly RETRY_FAILED_SUBSCRIPTION = 'retryFailedSubscription';

  public static readonly CLOSE_BILLING_BANNER = 'closeBillingBanner';

  public static readonly MOVE_DOCUMENTS_TO_FOLDER = 'moveDocumentsToFolder';

  public static readonly GET_NEXT_PAYMENT_INFO = 'getNextPaymentInfo';

  public static readonly GET_NEXT_SUBSCRIPTION_INFO = 'getNextSubscriptionInfo';

  public static readonly GET_MENTION_LIST = 'getMentionList';

  public static readonly GET_CURRENT_USER = 'getCurrentUser';

  public static readonly SEEN_NEW_VERSION = 'seenNewVersion';

  public static readonly CONFIRM_UPDATING_ANNOT_OF_ANOTHER = 'confirmUpdatingAnnotOfAnother';

  public static readonly CONTRACT_TEMPORARY = 'auth/contract-temporary';

  public static readonly RETRIEVE_SETUP_INTENT = 'retrieveSetupIntent';

  public static readonly RETRIEVE_SETUP_INTENT_V2 = 'retrieveSetupIntentV2';

  public static readonly DEACTIVATE_SETUP_INTENT = 'deactivateSetupIntent';

  public static readonly RETRIEVE_TRIAL_SETUP_INTENT = 'retrieveTrialSetupIntent';

  public static readonly RETRIEVE_ORGANIZATION_SETUPO_INTENT = 'retrieveOrganizationSetupIntent';

  public static readonly UPDATE_ORG_TEMPLATE_WORKSPACE = 'updateOrgTemplateWorkspace';

  public static readonly CHECK_DAILY_UPLOAD_DOC_LIMIT = 'checkDailyUploadDocLimit';

  public static readonly UPLOAD_PERSONAL_TEMPLATE = 'uploadPersonalTemplate';

  public static readonly UPLOAD_TEAM_TEMPLATE = 'uploadTeamTemplate';

  public static readonly UPLOAD_ORGANIZATION_TEMPLATE = 'uploadOrganizationTemplate';

  public static readonly GET_PERSONAL_TEMPLATES = 'getPersonalTemplates';

  public static readonly GET_ORGANIZATION_TEMPLATES = 'getOrganizationTemplates';

  public static readonly GET_TEAM_TEMPLATES = 'getTeamTemplates';

  public static readonly UPDATE_TEMPLATE_COUNTER = 'updateTemplateCounter';

  public static readonly GET_TEMPLATE_BY_ID = 'getTemplateById';

  public static readonly DELETE_TEMPLATE = 'deleteTemplate';

  public static readonly CREATE_DOCUMENT_FROM_TEMPLATE = 'createDocumentFromTemplate';

  public static readonly EDIT_TEMPLATE = 'editTemplate';

  public static readonly ADD_ASSOCIATE_DOMAIN = 'addAssociateDomain';

  public static readonly EDIT_ASSOCIATE_DOMAIN = 'editAssociateDomain';

  public static readonly REMOVE_ASSOCIATE_DOMAIN = 'removeAssociateDomain';

  public static readonly GET_SHARED_DOCUMENTS = 'getSharedDocuments';

  public static readonly BULK_UPDATE_DOCUMENT_MEMBER_LIST = 'bulkUpdateDocumentMemberList';

  public static readonly BULK_UPDATE_DOCUMENT_INVITED_LIST = 'bulkUpdateDocumentInvitedList';

  public static readonly UPDATE_USER_MOBILE_FREE_TOOLS_BANNER = 'updateUserMobileFreeToolsBanner';

  public static readonly TRACK_DOWNLOAD_CLICKED_EVENT = 'trackDownloadClickedEvent';

  public static readonly TERM_OF_USE = 'prismic/term-of-use';

  public static readonly SAVE_HUBSPOT_PROPERTIES = 'saveHubspotProperties';

  public static readonly UPDATE_META_DATA_OF_USER = 'updateUserMetadata';

  public static readonly DOWNLOAD_DOCUMENT = 'downloadDocument';

  public static readonly CREATE_TEMPLATE_BASE_ON_DOCUMENT = 'createTemplateBaseOnDocument';

  public static readonly REJECT_JOINED_ORG_INVITATION = 'rejectJoinedOrgInvitation';

  public static readonly ACCEPT_INVITATION_ORGANIZATION = 'acceptInvitationOrganization';

  public static readonly CHECK_REACH_DAILY_TEMPLATE_UPLOAD_LIMIT = 'checkReachDailyTemplateUploadLimit';

  public static readonly CREATE_USER_STARTED_DOCUMENT = 'createUserStartedDocument';

  public static readonly CREATE_ORG_STARTED_DOCUMENT = 'createOrgStartedDocument';

  public static readonly GET_GOOGLE_CONTACTS = 'getGoogleContacts';

  public static readonly SEND_REQUEST_JOIN_ORG = 'sendRequestJoinOrg';

  public static readonly GET_USERS_SAME_DOMAIN = 'getUsersSameDomain';

  public static readonly GET_SUGGESTED_ORG_LIST_OF_USER = 'getSuggestedOrgListOfUser';

  public static readonly GET_BILLING_CYCLE_OF_PLAN = 'getBillingCycleOfPlan';

  public static readonly GET_SUBSCRIPTION_BILLING_CYCLE = 'getSubscriptionBillingCycle';

  public static readonly UPDATE_DOMAIN_VISIBILITY_SETTING = 'updateDomainVisibilitySetting';

  public static readonly RESEND_ORGANIZATION_INVITATION = 'resendOrganizationInvitation';

  public static readonly RATE_FORM = 'community-template/rate-form';

  public static readonly GET_NOTIFICATION_BY_ID = 'getNotificationById';

  public static readonly TRACKING_USER_USE_DOCUMENT = 'trackingUserUseDocument';

  public static readonly CALCULATING_AVG_DOCUMENT_USED = 'document/avg-document-use';

  public static readonly GET_PRESIGNED_URL = 'document/get-presigned-url-for-static-tool-upload';

  public static readonly GET_USER_CURRENCY = 'getUserCurrency';

  public static readonly GET_REQUEST_ACCESS_DOC_BY_ID = 'getRequestAccessDocById';

  public static readonly REMOVE_ORGANIZATION_INVITATION = 'removeOrganizationInvitation';

  public static readonly UPLOAD_THIRD_PARTY_DOCUMENTS = 'uploadThirdPartyDocuments';

  public static readonly CREATE_PERSONAL_FOLDER_IN_ORG = 'createPersonalFolderInOrg';

  public static readonly GET_ORGANIZATION_FOLDERS = 'getOrganizationFolders';

  public static readonly GET_ORGANIZATION_FOLDER_TREE = 'getOrganizationFolderTree';

  public static readonly GET_ORGANIZATION_TEAMS_FOLDER_TREE = 'getOrganizationTeamsFolderTree';

  public static readonly GET_PERSONAL_FOLDER_TREE_IN_ORG = 'getPersonalFolderTreeInOrg';

  public static readonly GET_TOTAL_FOLDERS = 'getTotalFolders';

  public static readonly GET_PERSONAL_FOLDERS_IN_ORG = 'getPersonalFoldersInOrg';

  public static readonly CANCEL_ORGANIZATION_FREE_TRIAL = 'cancelOrganizationFreeTrial';

  public static readonly CHANGE_AUTO_UPGRADE_SETTING = 'changeAutoUpgradeSetting';

  public static readonly PREVIEW_UPCOMING_DOC_STACK_INVOICE = 'previewUpcomingDocStackInvoice';

  public static readonly PREVIEW_UPCOMING_SUBSCRIPTION_INVOICE = 'previewUpcomingSubscriptionInvoice';

  public static readonly GET_DOC_STACK_INFO = 'getDocStackInfo';

  public static readonly GET_MAIN_ORGANIZATION_CAN_REQUEST = 'getMainOrganizationCanRequest';

  public static readonly CREATE_DEFAULT_ORGANIZATION = 'createDefaultOrganization';

  public static readonly UPDATE_DEFAULT_WORKSPACE = 'updateDefaultWorkspace';

  public static readonly CHECK_THIRD_PARTY_STORAGE = 'checkThirdPartyStorage';

  public static readonly GET_ANNOTATIONS = 'getAnnotations';

  public static readonly GET_PREMIUM_TOOL_INFO_AVAILABLE_FOR_USER = 'getPremiumToolInfoAvailableForUser';

  public static readonly USER_USER_LOCATION = 'user/user-location';

  public static readonly HIDE_INFORM_MY_DOCUMENT_MODAL = 'hideInformMyDocumentModal';

  public static readonly SIGN_IN_BY_GOOGLE_V2 = 'signInByGoogleV2';

  public static readonly EXCHANGE_GOOGLE_TOKEN = 'exchangeGoogleToken';

  public static readonly GET_GOOGLE_ACCESS_TOKEN = 'getGoogleAccessToken';

  public static readonly FIND_AVAILABLE_LOCATION = 'findAvailableLocation';

  public static readonly REMOVE_PERSONAL_PAYMENT_METHOD = 'removePersonalPaymentMethod';

  public static readonly REMOVE_ORGANIZATION_PAYMENT_METHOD = 'removeOrganizationPaymentMethod';

  public static readonly CUSTOMER_INFO = 'customerInfo';

  public static readonly RATED_APP = 'ratedApp';

  public static readonly GET_ME = 'getMe';

  public static readonly GET_DOCUMENT_ORIGINAL_FILE_URL = 'getDocumentOriginalFileUrl';

  public static readonly RESTORE_ORIGINAL_VERSION = 'restoreOriginalVersion';

  public static readonly GET_PRESIGNED_URL_FOR_DOCUMENT_ORIGINAL_VERSION = 'getPresignedUrlForDocumentOriginalVersion';

  public static readonly CREATE_DOCUMENT_BACKUP_INFO_FOR_DOCUMENT = 'createDocumentBackupInfoForDocument';

  public static readonly SIGN_IN_WITH_LUMIN = 'signinWithLumin';

  public static readonly GET_PRESIGNED_URL_FOR_DOCUMENT_IMAGE = 'getPresignedUrlForDocumentImage';

  public static readonly GET_CREATED_SIGNATURE_PRESIGNED_URL = 'getCreatedSignaturePresignedUrl';

  public static readonly GET_USER_SIGNATURE_SIGNED_URLS = 'getUserSignatureSignedUrls';

  public static readonly GET_USER_SIGNATURE_SIGNED_URLS_IN_RANGE = 'getUserSignatureSignedUrlsInRange';

  public static readonly UPDATE_SIGNATURE_POSITION = 'updateSignaturePosition';

  public static readonly DELETE_DOCUMENT_IMAGES = 'deleteDocumentImages';

  public static readonly DELETE_TEMPORARY_CONTENT_FOR_DRIVE = 'deleteTemporaryContentForDrive';

  public static readonly CREATE_TEMPORARY_CONTENT_FOR_DRIVE = 'createTemporaryContentForDrive';

  public static readonly GET_PRESIGNED_URL_FOR_TEMPORARY_DRIVE = 'getPresignedUrlForTemporaryDrive';

  public static readonly GET_PRESIGNED_URL_FOR_UPLOAD_DOC = 'getPresignedUrlForUploadDoc';

  public static readonly GET_PRESIGNED_URL_FOR_UPLOAD_THUMBNAIL = 'getPresignedUrlForUploadThumbnail';

  public static readonly VERIFY_NEW_USER_INVITATION_TOKEN = 'verifyNewUserInvitationToken';

  public static readonly TRUSTPILOT_REVIEWS = 'trustpilot/get-reviews';

  public static readonly INTERCOM_CREATE_CONVERSATIONS = 'intercom/create-conversation';

  public static readonly INTERCOM_GENERATE_EPHEMERAL_TOKEN = 'intercom/generate-ephemeral-token';

  public static readonly INTERCOM_GENERATE_JWT = 'intercom/generate-jwt';

  public static readonly GET_PRESIGNED_URL_FOR_LUMIN_SIGN_INTERGRATION = 'getPresignedUrlForLuminSignIntegration';

  public static readonly UPDATE_MOBILE_FEEDBACK_MODAL_STATUS = 'updateMobileFeedbackModalStatus';

  public static readonly UPLOAD_MOBILE_FEEDBACK_FILES = 'user/uploadMobileFeedbackFiles';

  public static readonly GET_SIGNED_URL_FOR_OCR = 'getSignedUrlForOCR';

  public static readonly GET_USER_ANNOTATIONS = 'getUserAnnotations';

  public static readonly CREATE_USER_ANNOTATION = 'createUserAnnotation';

  public static readonly REMOVE_USER_ANNOTATION = 'removeUserAnnotation';

  public static readonly UPDATE_USER_ANNOTATION_POSITION = 'updateUserAnnotationPosition';

  public static readonly GET_TEMPORARY_DOCUMENT_PRESIGNED_URL = 'getTemporaryDocumentPresignedUrl';

  public static readonly GET_PRESIGNED_URL_FOR_MULTIPLE_DOCUMENT_IMAGES = 'getPresignedUrlForMultipleDocumentImages';

  public static readonly GET_USER_PAYMENT_INFO = 'user/payment-info';

  public static readonly VALIDATE_WHITELIST_IP = 'validateIPWhitelist';

  public static readonly CREATE_PDF_FROM_STATIC_TOOL_UPLOAD = 'createPdfFromStaticToolUpload';

  public static readonly USER_LAST_ACCESSED_ORG_PAYMENT_PLAN = 'user/get-static-tool-upload-workspace';

  public static readonly BLOG_VIEW_INCREASE_VIEW = 'blog-view/increase-view';

  public static readonly BLOG_VIEW_GET_BLOGS_MOST_VIEW = 'blog-view/get-blogs-most-view';

  public static readonly GET_CREDENTIALS_FROM_OPEN_GOOGLE = 'getCredentialsFromOpenGoogle';

  public static readonly REFRESH_DOCUMENT_IMAGE_SIGNED_URLS = 'refreshDocumentImageSignedUrls';

  public static readonly GET_SIGNED_URL_FOR_ANNOTATIONS = 'getSignedUrlForAnnotations';

  public static readonly GET_CREDENTIALS_FOR_OPEN_GOOGLE_FROM_MOBILE = 'getCredentialsForOpenGoogleFromMobile';

  public static readonly DEACTIVATE_ORGANIZATION_SETUP_INTENT = 'deactivateOrganizationSetupIntent';

  public static readonly GET_GOOGLE_USERS_NOT_IN_CIRCLE = 'getGoogleUsersNotInCircle';

  public static readonly EXTRA_TRIAL_DAYS_ORGANIZATION = 'extraTrialDaysOrganization';

  public static readonly UPDATE_INVITE_USERS_SETTING = 'updateInviteUsersSetting';

  public static readonly GET_PROMPT_INVITE_USERS_BANNER = 'getPromptInviteUsersBanner';

  public static readonly GET_SUGGESTED_USERS_TO_INVITE = 'getSuggestedUsersToInvite';

  public static readonly GET_DOCUMENT_OUTLINES = 'getDocumentOutlines';

  public static readonly IMPORT_DOCUMENT_OUTLINES = 'importDocumentOutlines';

  public static readonly GET_DOCUMENT_SUMMARIZATION = 'getDocumentSummarization';

  public static readonly UPDATE_DOCUMENT_SUMMARIZATION = 'updateDocumentSummarization';

  public static readonly GET_SUGGESTED_PREMIUM_ORG_LIST_OF_USER = 'getSuggestedPremiumOrgListOfUser';

  public static readonly GET_FORM_FIELD = 'getFormField';

  public static readonly CREATE_SHARE_DOC_FEEDBACK = 'createShareDocFeedback';

  public static readonly BATCH_CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL = 'batchCreatePresignedFormFieldDetectionUrl';

  public static readonly GET_BACKUP_ANNOTATION_PRESIGNED_URL = 'getBackupAnnotationPresignedUrl';

  public static readonly GET_DOCUMENT_VERSION_LIST = 'getDocumentVersionList';

  public static readonly GET_VERSION_PRESIGNED_URL = 'getVersionPresignedUrl';

  public static readonly GET_DOCUMENT_VERSION = 'getDocumentVersion';

  public static readonly GET_ONEDRIVE_TOKEN = 'getOnedriveToken';

  public static readonly GET_PDF_FORM_TEMPLATE = 'getPDFFormTemplate';

  public static readonly GET_REPRESENTATIVE_MEMBERS = 'getRepresentativeMembers';

  public static readonly DELETE_MULTIPLE_FOLDER = 'deleteMultipleFolder';

  public static readonly GET_PAYMENT_METHOD = 'getPaymentMethod';

  public static readonly UPDATE_PAYMENT_METHOD = 'updatePaymentMethod';

  public static readonly CREATE_PRESIGNED_FORM_FIELD_DETECTION_URL = 'createPresignedFormFieldDetectionUrl';

  public static readonly COUNT_DOC_STACK_USAGE = 'countDocStackUsage';

  public static readonly GET_FORM_FIELD_DETECTION_USAGE = 'getFormFieldDetectionUsage';

  public static readonly CREATE_FORM_DETECTION_FEEDBACK = 'createFormDetectionFeedback';

  public static readonly INCREASE_EXPLORED_FEATURE_USAGE = 'increaseExploredFeatureUsage';

  public static readonly PROCESS_APPLIED_FORM_FIELDS = 'processAppliedFormFields';

  public static readonly GET_USERS_INVITABLE_TO_ORG = 'getUsersInvitableToOrg';

  public static readonly CHECK_ORGANIZATION_DOC_STACK = 'checkOrganizationDocStack';

  public static readonly GET_CUSTOMER_STORIES = 'customer-stories';

  public static readonly GET_CUSTOMER_STORIES_BY_ORDER_NUMBER = 'customer-stories/order-number';

  public static readonly GET_NON_ORDER_CUSTOMER_STORIES = 'customer-stories/non-order-number';

  public static readonly GET_ORGANIZATION_RESOURCES = 'getOrganizationResources';

  public static readonly CREATE_MOBILE_FEEDBACK = 'createMobileFeedback';

  public static readonly CHECK_SIMPLE_PDF = 'document-checker/simple-pdf';

  public static readonly CHECK_DOWNLOAD_MULTIPLE_DOCUMENTS = 'checkDownloadMultipleDocuments';

  public static readonly UPDATE_STACKED_DOCUMENTS = 'updateStackedDocuments';

  public static readonly PROCESS_DOCUMENT_FOR_CHATBOT = 'processDocumentForChatbot';

  public static readonly GET_PRESIGNED_URL_FOR_ATTACHED_FILES = 'getPresignedUrlForAttachedFiles';

  public static readonly SAVE_ATTACHED_FILES_METADATA = 'saveAttachedFilesMetadata';

  public static readonly CHECK_ATTACHED_FILES_METADATA = 'checkAttachedFilesMetadata';

  public static readonly GET_COMPRESS_DOCUMENT_PRESIGNED_URL = 'getCompressDocumentPresignedUrl';

  public static readonly CREATE_ORGANIZATION_INVITE_LINK = 'createOrganizationInviteLink';

  public static readonly GET_ORGANIZATION_INVITE_LINK = 'getOrganizationInviteLink';

  public static readonly REGENERATE_ORGANIZATION_INVITE_LINK = 'regenerateOrganizationInviteLink';

  public static readonly DELETE_ORGANIZATION_INVITE_LINK = 'deleteOrganizationInviteLink';

  public static readonly VERIFY_ORGANIZATION_INVITE_LINK = 'verifyOrganizationInviteLink';

  public static readonly INIT_SLACK_OAUTH = 'initSlackOAuth';

  public static readonly GET_SLACK_TEAMS = 'getSlackTeams';

  public static readonly GET_SLACK_CHANNELS = 'getSlackChannels';

  public static readonly REVOKE_SLACK_CONNECTION = 'revokeSlackConnection';

  public static readonly GET_SLACK_RECIPIENTS = 'getSlackRecipients';

  public static readonly COUNT_SLACK_CHANNEL_MEMBERS = 'countSlackChannelMembers';

  public static readonly PRE_CHECK_SHARE_DOCUMENT_IN_SLACK = 'preCheckShareDocumentInSlack';

  public static readonly SHARE_DOCUMENT_IN_SLACK = 'shareDocumentInSlack';

  public static readonly GET_PRESIGNED_URL_FOR_EXTERNAL_PDF_BY_ENCODE_DATA = 'getSignedUrlForExternalPdfByEncodeData';

  public static readonly CHECK_SHARE_THIRD_PARTY_DOCUMENT = 'checkShareThirdPartyDocument';

  public static readonly GET_ORGANIZATION_WITH_JOIN_STATUS = 'getOrganizationWithJoinStatus';

  public static readonly WEB_CHATBOT_STREAM_CHAT = 'webchatbot/chat';

  public static readonly GET_FOLDERS_AVAILABILITY = 'getFoldersAvailability';

  public static readonly ACCEPT_NEW_TERMS_OF_USE = 'acceptNewTermsOfUse';

  public static readonly GET_TERMS_OF_USE_VERSION = 'user/accept-new-terms-of-use';

  public static readonly GET_AUTO_DETECTION_USAGE = 'getAutoDetectionUsage';

  public static readonly STAR_RATING = 'functional-landing-page-rating';

  public static readonly UPSERT_SAML_SSO_CONFIGURATION = 'upsertSamlSsoConfiguration';

  public static readonly DELETE_SAML_SSO_CONFIGURATION = 'deleteSamlSsoConfiguration';

  public static readonly GET_SAML_SSO_CONFIGURATION = 'getSamlSsoConfiguration';

  public static readonly ENABLE_SCIM_SSO_PROVISION = 'enableScimSsoProvision';

  public static readonly DISABLE_SCIM_SSO_PROVISION = 'disableScimSsoProvision';

  public static readonly GET_SCIM_SSO_CONFIGURATION = 'getScimSsoConfiguration';

  public static readonly ASSIGN_SIGN_SEATS = 'assignSignSeats';

  public static readonly UNASSIGN_SIGN_SEATS = 'unassignSignSeats';

  public static readonly REQUEST_SIGN_SEAT = 'requestSignSeat';

  public static readonly REJECT_SIGN_SEAT_REQUESTS = 'rejectSignSeatRequests';

  public static readonly UPLOAD_DOCUMENT_TEMPLATE_TO_PERSONAL = 'uploadDocumentTemplateToPersonal';

  public static readonly UPLOAD_DOCUMENT_TEMPLATE_TO_ORGANIZATION = 'uploadDocumentTemplateToOrganization';

  public static readonly UPLOAD_DOCUMENT_TEMPLATE_TO_ORGANIZATION_TEAM = 'uploadDocumentTemplateToOrgTeam';

  public static readonly GET_ORGANIZATION_DOCUMENT_TEMPLATES = 'getOrganizationDocumentTemplates';

  public static readonly GET_ORGANIZATION_TEAM_DOCUMENT_TEMPLATES = 'getOrganizationTeamDocumentTemplates';

  public static readonly GET_DOCUMENT_TEMPLATE = 'documentTemplate';

  public static readonly DELETE_DOCUMENT_TEMPLATE = 'deleteDocumentTemplate';

  public static readonly CREATE_DOCUMENT_FROM_DOCUMENT_TEMPLATE = 'createDocumentFromDocumentTemplate';

  public static readonly RETRIEVE_ORGANIZATION_SETUP_INTENT_V2 = 'retrieveOrganizationSetupIntentV2';

  public static readonly RETRIEVE_SETUP_INTENT_V3 = 'retrieveSetupIntentV3';

  public static readonly ACCEPT_AI_CHATBOT_CONSENT = 'acceptAiChatbotConsent';

  public static readonly UPDATE_DOCUMENT_MIME_TYPE_TO_PDF = 'updateDocumentMimeTypeToPdf';

  public static readonly UPDATE_DOCUMENT_ACTION_PERMISSION_SETTINGS = 'updateDocumentActionPermissionSettings';
}
