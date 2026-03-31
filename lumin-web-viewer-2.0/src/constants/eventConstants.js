import { Colors } from 'constants/lumin-common';

import { DASHBOARD_TYPE } from './dashboardConstants';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class UserEventConstants {
  static Events = {
    DocumentEvents: {
      DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
      DOCUMENT_OPENED: 'DOCUMENT_OPENED',
      DOCUMENT_DELETED: 'DOCUMENT_DELETED',
      DOCUMENT_ANNOTATED: 'DOCUMENT_ANNOTATED',
      DOCUMENT_SIGNED: 'DOCUMENT_SIGNED',
      DOCUMENT_COMMENTED: 'DOCUMENT_COMMENTED',
      DOCUMENT_MANIPULATED: 'DOCUMENT_MANIPULATED',
      COMMENT_REPLIED: 'COMMENT_REPLIED',
      COMMENT_MENTIONED: 'COMMENT_MENTIONED',
      COMMENT_DELETED: 'COMMENT_DELETED',
      DOCUMENT_SHARED: 'DOCUMENT_SHARED',
      DOCUMENT_REQUESTED_TO_ACCESS: 'DOCUMENT_REQUESTED_TO_ACCESS',
    },
    TeamEvents: {
      TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED',
      TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
      TEAM_MEMBER_LEFT: 'TEAM_MEMBER_LEFT',
      TEAM_OWNERSHIP_TRANSFERED: 'TEAM_OWNERSHIP_TRANSFERED',
      TEAM_MEMBER_ROLE_CHANGED: 'TEAM_MEMBER_ROLE_CHANGED',
      TEAM_PLAN_CHANGED: 'TEAM_PLAN_CHANGED',
      TEAM_PLAN_CANCELED: 'TEAM_PLAN_CANCELED',
      TEAM_PLAN_RENEWED: 'TEAM_PLAN_RENEWED',
    },
    HeaderButtonsEvent: {
      CHANGE_NAME: 'ChangeName',
      ADD_TO_STAR: 'AddToStar',
      MOVE_DOCUMENT: 'MoveDocument',
      SHARE: 'Share',
      DOWNLOAD: 'Download',
      PRINT: 'Print',
      MAKE_COPY: 'MakeACopy',
      DARK_MODE: 'DarkMode',
      PAN_TOOL: 'PanTool',
      ZOOM: 'Zoom',
      VIEW_CONTROL: 'ViewControl',
      ROTATE: 'Rotate',
      UNDO: 'Undo',
      REDO: 'Redo',
      HIGHLIGHT: 'Highlight',
      TEXT_TOOLS: 'TextTools',
      FREE_TEXT: 'FreeText',
      FREE_HAND_TOOL: 'FreeHandTool',
      SHAPE_TOOLS: 'ShapeTools',
      ERASER: 'Eraser',
      IMAGE: 'Image',
      RUBBER_STAMP: 'rubberStamp',
      DATE_STAMP: 'dateStamp',
      SIGNATURE_TOOL: 'SignatureTool',
      COMMENT: 'Comment',
      COMMENT_HISTORY: 'CommentHistory',
      SEARCH_BOX: 'SearchBox',
      PAGE_TOOLS_BUTTON: 'PageToolsButton',
      FULLSCREEN: 'FullScreen',
      HIDE_THE_TOP_BAR: 'HideTheTopBar',
      THUMBNAILS: 'Thumbnails',
      OUTLINES: 'Outlines',
      ADD_NOTE: 'AddNote',
      BOOKMARKS: 'Bookmark',
      FILE_INFO: 'FileInfo',
      HELP_BUTTON: 'HelpButton',
      FREEHAND_HIGHLIGHT: 'FreehandHighlight',
      ADD_PARAGRAPH: 'AddParagraph',
      IN_VIEWER_MENU: 'inViewerMenu',
    },
    ThumbnailsButtonEvent: {
      ROTATE_RIGHT: 'RotateRightButton',
      ROTATE_LEFT: 'RotateLeftButton',
      DELETE: 'DeleteButton',
    },
  };

  static EventNames = Object.values(UserEventConstants.Events).reduce((acc, current) => {
    acc = { ...acc, ...current };
    return acc;
  }, {});

  static EventType = {
    DOCUMENT: 'DOCUMENT',
    TEAM: 'TEAM',
    ORGANIZATION: 'ORGANIZATION',
    HIGHLIGHT_CREATED: 'highlightCreated',
    SIGNATURE_CREATED: 'signatureCreated',
    IMAGE_ADDED: 'imageAdded',
    DOCUMENT_PAGE_DELETED: 'documentPageDeleted',
    DOCUMENT_PAGE_MOVED: 'documentPageMoved',
    DOCUMENT_INSERT_BLANK_PAGE: 'documentInsertBlankPage',
    DOCUMENT_ROTATED: 'documentRotated',
    DOCUMENT_CROP_PAGE: 'documentCropPage',
    USER_SHARED_DOCUMENT: 'userSharedDocument',
    USER_REQUEST_DOCUMENT_ACCESS: 'userRequestDocumentAccess',
    USER_GRANT_DOCUMENT_ACCESS: 'userGrantDocumentAccess',
    USER_DENY_DOCUMENT_ACCESS: 'userDenyDocumentAccess',
    UPLOAD_DOCUMENT: 'UploadDocument',
    DOCUMENT_MERGED: 'documentMerged',
    DOCUMENT_SPLIT_PAGES: 'documentSplitPages',
    ANNOTATION_CREATED: 'annotationCreated',
    ANNOTATION_MODIFIED: 'annotationModified',
    ANNOTATION_DELETED: 'annotationDeleted',
    COMMENT_CREATED: 'commentCreated',
    INSTANT_SYNC_CLICK: 'instantSyncClick',
    VARIATION_VIEW: 'variationView',
    BANNER_VIEWED: 'bannerViewed',
    BUTTON_VIEW: 'buttonView',
    BANNER_DISMISS: 'bannerDismiss',
    BANNER_CONFIRMATION: 'bannerConfirmation',
    ENTIRE_DOCUMENT_ROTATED: 'entireDocumentRotated',
    CLICK: 'click',
    HEADER_BUTTON: 'headerButton',
    RIGHT_SIDE_BAR_BUTTON: 'rightSideBarButton',
    THUMBNAIL_BUTTON: 'thumbnailButton',
    ADD_FORM_BUILDER_ELEMENT: 'addFormBuilderElement',
    DELETE_FORM_BUILDER_ELEMENT: 'formBuilderElementDelete',
    RESIZE_FORM_BUILDER_ELEMENT: 'formBuilderElementResize',
    MOVE_FORM_BUILDER_ELEMENT: 'formBuilderElementMove',
    CHANGE_TYPE_FORM_BUILDER_ELEMENT: 'formBuilderElementTypeChange',
    APPLY_FORM_BUILDER_ELEMENT: 'applyFormBuilderElement',
    USER_REACTIVATED_PAID: 'userReactivatedPaid',
    REQUEST_DOCUMENT_PERMISSION: 'requestDocumentPermission',
    REJECT_DOCUMENT_PERMISSION: 'rejectDocumentPermission',
    ACCEPT_DOCUMENT_PERMISSION: 'acceptDocumentPermission',
    DOCUMENT_INFO: 'documentInfo',
    SWITCH_LANGUAGE: 'switchLanguage',
    TIMING: 'timing',
    WEB_VITALS: 'webVitals',
    FORM_BUILDER_ELEMENT_CHANGE: 'formBuilderElementChange',
    UPLOAD_DOCUMENT_SUCCESS_APP: 'upload_document_success_app',
    OCR_DOCUMENT: 'OCRDocument',
    SIGNATURE_INFO: 'signatureInfo',
    OUTLINE_CREATED: 'outlineCreated',
    TRACKING_PERFORMANCE: 'trackingPerformance',
    DOCUMENT_RESTORED: 'documentRestored',
    WORKSPACE_SWITCHER: 'workspaceSwitcher',
    SYNC_DOCUMENT: 'syncDocument',
    IMPORT_DOCUMENT: 'importDocument',
    INVITE_MEMBER_TO_WORKSPACE: 'inviteMemberToWorkspace',
    SURVEY_RESPONSE: 'surveyResponse',
    DOCUMENT_COMPRESSED: 'documentCompressed',
    CHATBOT_OPENED: 'chatbotOpened',
    CONVERT_FILE_TO_LUMIN: 'convertFileToLumin',
    CHATBOT_MESSAGE_SENT: 'messageSent',
    CHATBOT_MESSAGE_RECEIVED: 'messageReceived',
    CHATBOT_CONSENT_ACCEPTED: 'consentAccepted',
    USER_COMPLETED_CANCELLATION_PROMPT_CYCLE: 'userCompletedCancellationPromptCycle',
    VIEWER_QUICK_SEARCH: 'viewerQuickSearch',
    QUICK_SEARCH_UPDATE: 'quickSearchUpdate',
    TEMPLATE_CREATED: 'templateCreated',
    DOC_CREATE_FROM_TEMPLATE: 'docCreatedFromTemplate',
    DELETE_TEMPLATE: 'deleteTemplate',
    DOCUMENT_CONVERTED: 'documentConverted',
  };

  static BrazeTriggerEvent = {
    TRIGGER_FREE_TRIAL: 'trigger_free_trial_modal_viewer',
    TRIGGER_REACTIVATE_ACCOUNT_MODAL: 'trigger_reactivate_account_modal',
  };

  static isDocumentEvent(eventName) {
    return Object.values(UserEventConstants.Events.DocumentEvents).includes(eventName);
  }

  static isTeamEvent(eventName) {
    return Object.values(UserEventConstants.Events.TeamEvents).includes(eventName);
  }

  static getEventType(eventName) {
    if (UserEventConstants.isDocumentEvent(eventName)) {
      return UserEventConstants.EventType.DOCUMENT;
    }
    if (UserEventConstants.isTeamEvent(eventName)) {
      return UserEventConstants.EventType.TEAM;
    }
    return null;
  }

  static EventIconMapping = {
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_UPLOADED]: {
      backgroundColor: Colors.ROYALBLUE,
      icon: 'upload-btn',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_OPENED]: {
      backgroundColor: Colors.ROYALBLUE,
      icon: 'open',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_DELETED]: {
      backgroundColor: Colors.RED,
      icon: 'cancel',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_ANNOTATED]: {
      backgroundColor: Colors.YELLOW,
      icon: 'open',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_SIGNED]: {
      backgroundColor: Colors.GREEN,
      icon: 'sign-save',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_COMMENTED]: {
      backgroundColor: Colors.YELLOW,
      icon: 'comment',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_MANIPULATED]: {
      backgroundColor: Colors.YELLOW,
      icon: 'manipulation',
    },
    [UserEventConstants.Events.DocumentEvents.COMMENT_REPLIED]: {
      backgroundColor: Colors.YELLOW,
      icon: 'comment',
    },
    [UserEventConstants.Events.DocumentEvents.COMMENT_MENTIONED]: {
      backgroundColor: Colors.YELLOW,
      icon: 'comment',
    },
    [UserEventConstants.Events.DocumentEvents.COMMENT_DELETED]: {
      backgroundColor: Colors.YELLOW,
      icon: 'comment',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_SHARED]: {
      backgroundColor: Colors.ROYALBLUE,
      icon: 'share',
    },
    [UserEventConstants.Events.DocumentEvents.DOCUMENT_REQUESTED_TO_ACCESS]: {
      backgroundColor: Colors.ROYALBLUE,
      icon: 'share',
    },
  };

  static object(payload) {
    const {
      _id,
      eventName,
      eventTime,
      actor,
      target,
      document,
      team,
      organization,
    } = payload;

    if (!Object.values(UserEventConstants.EventNames).includes(eventName)) {
      throw new Error('Event name is not registered!');
    }

    let origin = DASHBOARD_TYPE.PERSONAL;

    if (team) {
      origin = DASHBOARD_TYPE.TEAM;
    }

    return {
      _id,
      eventName,
      eventTime,
      actor,
      target,
      document,
      team,
      organization,
      eventType: UserEventConstants.getEventType(eventName),
      origin,
    };
  }
}

export default UserEventConstants;
