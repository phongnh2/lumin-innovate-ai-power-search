// subscription name
export const SUBSCRIPTION_UPDATE_DOCUMENT_LIST = 'updateDocumentList';
export const SUBSCRIPTION_UPDATE_DOCUMENT_INFO = 'updateDocumentInfo';
export const SUBSCRIPTION_UPDATE_TEAMS = 'updateTeams';
export const SUBSCRIPTION_DOCUMENT_BOOKMARK = 'updateBookmark';
export const SUBSCRIPTION_UPDATE_ORG = 'updateOrganization';
export const SUBSCRIPTION_REMOVE_ORG_MEMBER = 'removeOrgMember';
export const SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE = 'updateOrgMemberRole';
export const SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT = 'deleteOriginalDocument';
export const SUBSCRIPTION_DELETE_ORGANIZATION = 'deleteOrganizationSub';
export const SUBSCRIPTION_DELETE_USER_ACCOUNT = 'deleteAccountSubscription';
export const SUBSCRIPTION_CONVERT_ORGANIZATION = 'convertOrganization';
export const SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION = 'updateConvertedOrganization';
export const SUBSCRIPTION_UPDATE_ADMIN_PERMISSION = 'updateAdminPermission';
export const SUBSCRIPTION_UPDATE_USER = 'updateUserSubscription';
export const SUBSCRIPTION_CREATE_FOLDER = 'createFolderSubscription';
export const SUBSCRIPTION_UPDATE_FOLDER = 'updateFolderSubscription';
export const SUBSCRIPTION_FOLDER_EVENT = 'folderEventSubscription';
export const SUBSCRIPTION_CHANGED_DOCUMENT_STACK = 'changedDocumentStackSubscription';
export const NEW_NOTIFICATION = 'newNotification';
export const DELETE_NOTIFICATION = 'deleteNotification';
export const SUBSCRIPTION_NEW_WIDGET_NOTIFICATION = 'newWidgetNotification';
export const SUBSCRIPTION_DISMISS_WIDGET_NOTIFICATION = 'dismissWidgetNotificationSub';
export const SUBSCRIPTION_DISMISS_ALL_WIDGET_NOTIFICATION = 'dismissAllWidgetNotificationSub';
export const SUBSCRIPTION_DOCUMENT_SHARING_QUEUE = 'documentSharingQueue';
export const SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK = 'updateOrganizationInviteLink';
export const SUBSCRIPTION_UPDATE_CONTRACT_STACK = 'updateContractStackSubscription';
export const SUBSCRIPTION_UPDATE_SIGN_SEAT = 'updateSignSeatSubscription';
export const SUBSCRIPTION_UPDATE_DOCUMENT_TEMPLATE_LIST = 'updateDocumentTemplateList';
export const SUBSCRIPTION_DELETE_DOCUMENT_TEMPLATE = 'deleteDocumentTemplate';
export const SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED = 'timeSensitiveCouponCreated';

// type subscription
// DOCUMENT LIST
export const SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL = 'subcription_upload_document_personal';
export const SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS = 'subcription_upload_document_teams';
export const SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION = 'subcription_upload_document_organization';
export const SUBSCRIPTION_DOCUMENT_LIST_SHARE = 'subcription_share';
export const SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE = 'subcription_remove_share';
export const SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL = 'subcription_remove_document_personal';
export const SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS = 'subcription_remove_document_teams';
export const SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION = 'subcription_remove_document_organization';
export const SUBSCRIPTION_DOCUMENT_LIST_RECENT_DOCUMENT_ADDED = 'subscription_document_list_recent_document_added';

export const SUBSCRIPTION_DOCUMENT_LIST_FAVORITE = 'subcription_update_favorite_list';
// DOCUMENT INFO
export const SUBSCRIPTION_DOCUMENT_INFO_NAME = 'subcription_update_name';
export const SUBSCRIPTION_DOCUMENT_INFO_THUMBNAIL = 'subcription_update_thumbnail';
export const SUBSCRIPTION_DOCUMENT_INFO_FAVORITE = 'subcription_update_favorite_info';
export const SUBSCRIPTION_DOCUMENT_INFO_PRINCIPLE_LIST = 'subcription_update_principle_list';
// TEAMS
export const SUBSCRIPTION_UPDATE_TEAMS_INFO = 'subcription_update_team_info';
export const SUBSCRIPTION_REMOVE_TEAM = 'subcription_remove_team';
export const SUBSCRIPTION_TRANSFER_TEAM_OWNER = 'subscription_transfer_team_owner';
export const SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_MANAGER = 'subscription_transfer_team_owner_by_manager';
export const SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_LUMIN_ADMIN = 'subscription_transfer_team_owner_by_lumin_admin';

// ORGANIZATION
export const SUBSCRIPTION_TRANSFER_ORG_ADMIN = 'subscription_transfer_org_admin';
export const SUBSCRIPTION_DOWNGRADE_BILLING_MODERATOR = 'subscription_downgrade_billing_moderator';
export const SUBSCRIPTION_PAYMENT_UPDATE = 'subscription_payment_update';
export const SUBSCRIPTION_AUTO_APPROVE_UPDATE = 'subscription_auto_approve_update';
export const SUBSCRIPTION_GOOGLE_SIGN_IN_SECURITY_UPDATE = 'subscription_google_sign_in_security_update';
export const SUBSCRIPTION_CONVERT_TO_MAIN_ORGANIZATION = 'subscription_convert_to_main_organization';
export const SUBSCRIPTION_CONVERT_TO_CUSTOM_ORGANIZATION = 'subscription_convert_to_custom_organization';
export const SUBSCRIPTION_SETTING_UPDATE = 'subscription_setting_update';
export const SUBSCRIPTION_SAML_SSO_SIGN_IN_SECURITY_UPDATE = 'subscription_saml_sso_sign_in_security_update';

// ADMIN
export const SUBSCRIPTION_DELETE_ADMIN = 'subscription_delete_admin';
export const SUBSCRIPTION_CHANGE_ADMIN_ROLE = 'subscription_change_admin_role';
// USER
export const SUBSCRIPTION_CANCELED_USER_PAYMENT = 'subscription_canceled_user_payment';
export const SUBSCRIPTION_SHOW_RATING_MODAL = 'subscription_show_rating_modal';
export const SUBSCRIPTION_MIGRATING_USER_SUCCESS = 'subscription_migrating_user_success';
export const SUBSCRIPTION_ENABLE_GOOGLE_SIGN_IN_SUCCESS = 'subscription_enable_google_sign_in_success';

// FOLDER
export const SUB_CREATE_FOLDER_EVENT = 'subscription_create_folder';
export const SUB_DELETE_FOLDER_EVENT = 'subscription_delete_folder';
export const SUB_UPDATE_FOLDER_INFO_EVENT = 'subscription_update_folder_info';
export const SUB_UPDATE_STARRED_FOLDER_EVENT = 'subscription_update_starred_folder';

// DOCUMENT TEMPLATE LIST
export const SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_PERSONAL = 'subcription_upload_document_template_personal';
export const SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_TEAMS = 'subcription_upload_document_template_teams';
export const SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_ORGANIZATION = 'subcription_upload_document_template_organization';
export const SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_PERSONAL = 'subcription_delete_document_template_personal';
export const SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_TEAMS = 'subcription_delete_document_template_teams';
export const SUBSCRIPTION_DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_ORGANIZATION = 'subcription_delete_document_template_organization';
