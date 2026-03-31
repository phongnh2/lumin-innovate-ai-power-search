// type subcription
class SubscriptionConstants {
  static Subscription = {
    // DOCUMENT LIST
    DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL: 'subcription_upload_document_personal',
    DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS: 'subcription_upload_document_teams',
    DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION: 'subcription_upload_document_organization',
    DOCUMENT_LIST_SHARE: 'subcription_share',
    DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL: 'subcription_remove_document_personal',
    DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS: 'subcription_remove_document_teams',
    DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION: 'subcription_remove_document_organization',
    DOCUMENT_LIST_REMOVE_SHARE: 'subcription_remove_share',
    DOCUMENT_LIST_MOVE_DOCUMENT: 'subcription_move_document',
    DOCUMENT_LIST_UNDO_MOVE_DOCUMENT: 'subcription_undo_move_document',
    DOCUMENT_LIST_RECENT_DOCUMENT_ADDED: 'subscription_document_list_recent_document_added',

    // DOCUMENT INFO
    DOCUMENT_LIST_FAVORITE: 'subcription_update_favorite_list',
    DOCUMENT_NAME_INFO: 'subcription_update_name',
    DOCUMENT_SETTINGS: 'subcription_update_document_settings',
    DOCUMENT_FAVORITE_INFO: 'subcription_update_favorite_info',
    DOCUMENT_THUMBNAIL_INFO: 'subcription_update_thumbnail',
    DOCUMENT_PRINCIPLE_LIST: 'subcription_update_principle_list',

    // TEAM
    UPDATE_TEAMS_INFO: 'subcription_update_team_info',
    REMOVE_TEAM: 'subcription_remove_team',
    TRANSFER_TEAM_OWNERSHIP: 'subscription_transfer_team_owner',
    TRANSFER_TEAM_OWNERSHIP_BY_LUMIN_ADMIN: 'subscription_transfer_team_owner_by_lumin_admin',
    TRANSFER_TEAM_OWNERSHIP_BY_MANAGER: 'subscription_transfer_team_owner_by_manager',
    TEAM_SETTING_UPDATE: 'subscription_setting_update',
    // FOLDER
    CREATE_FOLDER: 'subscription_create_folder',
    DELETE_FOLDER: 'subscription_delete_folder',
    UPDATE_FOLDER_INFO: 'subscription_update_folder_info',
    UPDATE_STARRED_FOLDER: 'subscription_update_starred_folder',

    // DOCUMENT TEMPLATE
    DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_PERSONAL: 'subcription_upload_document_template_personal',
    DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_TEAMS: 'subcription_upload_document_template_teams',
    DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_ORGANIZATION: 'subcription_upload_document_template_organization',
    DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_PERSONAL: 'subcription_delete_document_template_personal',
    DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_TEAMS: 'subcription_delete_document_template_teams',
    DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_ORGANIZATION: 'subcription_delete_document_template_organization',
  };

  static Type = {
    AddDocSubscriptionTypes: [
      SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_SHARE,
    ],
    RemoveDocSubscriptionTypes: [
      SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_SHARE,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_MOVE_DOCUMENT,
      SubscriptionConstants.Subscription.DOCUMENT_LIST_UNDO_MOVE_DOCUMENT,
    ],
    UpdateDocInfoSubscriptionTypes: [
      SubscriptionConstants.Subscription.DOCUMENT_LIST_FAVORITE,
      SubscriptionConstants.Subscription.DOCUMENT_NAME_INFO,
      SubscriptionConstants.Subscription.DOCUMENT_SETTINGS,
      SubscriptionConstants.Subscription.DOCUMENT_PRINCIPLE_LIST,
    ],
    UpdateTeamSubscriptionTypes: [
      SubscriptionConstants.Subscription.UPDATE_TEAMS_INFO,
      SubscriptionConstants.Subscription.REMOVE_TEAM,
      SubscriptionConstants.Subscription.TRANSFER_TEAM_OWNERSHIP,
      SubscriptionConstants.Subscription.TRANSFER_TEAM_OWNERSHIP_BY_LUMIN_ADMIN,
    ],
  };

  static isAddDocumentSubscription(subscriptionType) {
    return SubscriptionConstants.Type.AddDocSubscriptionTypes.includes(subscriptionType);
  }

  static isRemoveDocumentSubscription(subscriptionType) {
    return SubscriptionConstants.Type.RemoveDocSubscriptionTypes.includes(subscriptionType);
  }

  static isUpdateDocInfoSubscription(subscriptionType) {
    return SubscriptionConstants.Type.UpdateDocInfoSubscriptionTypes.includes(subscriptionType);
  }
}

export default SubscriptionConstants;
