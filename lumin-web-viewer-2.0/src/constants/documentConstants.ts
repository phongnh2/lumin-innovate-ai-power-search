import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

export const ItemTypes = {
  DOCUMENT: 'document',
};

export const TIME_TOGGLE = 600;

export const DocumentStorage = {
  GOOGLE: 'Google Drive',
  DROPBOX: 'Dropbox',
  S3: 'Lumin',
  SYSTEM: 'device',
  ONEDRIVE: 'OneDrive',
};

export const filterCondition = {
  ownerFilter: 'OWNER_FILTER',
  modifiedFilter: 'LAST_MODIFIED_FILTER',
};

export const ownerFilter = {
  byAnyone: 'BY_ANYONE',
  byMe: 'BY_ME',
  notByMe: 'NOT_BY_ME',
};

export const modifiedFilter = {
  modifiedByMe: 'MODIFIED_BY_ME',
  modifiedByAnyone: 'MODIFIED_BY_ANYONE',
};

export const layoutType = {
  list: 'list',
  grid: 'grid',
};

export const folderType = {
  DEVICE: 'device',
  INDIVIDUAL: 'individual',
  TEAMS: 'teams',
  ORGANIZATION: 'organization',
  STARRED: 'starred',
  SHARED: 'shared',
  RECENT: 'recent',
};

// Uploaded Documents
export const ownedOptions = [
  {
    label: 'documentPage.ownedByAnyone',
    value: 'BY_ANYONE',
  },
  {
    label: 'documentPage.ownedByMe',
    value: 'BY_ME',
  },
  {
    label: 'documentPage.notOwnedByMe',
    value: 'NOT_BY_ME',
  },
];

export const modifiedOptions = [
  {
    label: 'Last open by anyone',
    value: 'MODIFIED_BY_ANYONE',
  },
  {
    label: 'Last open by me',
    value: 'MODIFIED_BY_ME',
  },
];

export const documentStorage = {
  dropbox: 'dropbox',
  google: 'google',
  s3: 's3',
  system: 'system',
  caching: 'caching',
  onedrive: 'onedrive',
};

export const documentGraphUpdateQuery = {
  ADD: 'add',
  REMOVE: 'remove',
};

export const documentRealtimeEvent = {
  ADD_STAR: 'add_star',
  REMOVE_STAR: 'remove_star',
  ADD_PERSONAL_DOCUMENT: 'add_personal_document',
  REMOVE_PERSONAL_DOCUMENT: 'remove_personal_document',
  ADD_TEAM_DOCUMENT: 'add_team_document',
  REMOVE_TEAM_DOCUMENT: 'remove_team_document',
  MOVE: 'move',
};

export const UserSharingType = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  REQUEST_ACCESS: 'request_access',
};

export const AnnotationSubjectMapping = {
  arrow: 'Arrow',
  callout: 'Callout',
  caret: 'Caret',
  polygonCloud: 'Cloud',
  custom: 'Custom',
  ellipse: 'Ellipse',
  eraser: 'Eraser',
  fileattachment: 'File attachment',
  freehand: 'Free hand',
  freehandHighlight: 'Free Hand Highlight',
  freetext: 'Free text',
  highlight: 'Highlight',
  line: 'Line',
  polygon: 'Polygon',
  polyline: 'Polyline',
  rectangle: 'Rectangle',
  redact: 'Redact',
  signature: 'Signature',
  squiggly: 'Squiggly',
  stamp: 'Stamp',
  stickyNote: 'Comment',
  strikeout: 'Strikeout',
  underline: 'Underline',
  rubberStamp: 'Rubber Stamp',
  star: 'Star',
  tick: 'Tick',
  cross: 'Cross',
  noName: 'Annotation',
  removal: 'Removal',
  widget: 'Widget',
  link: 'Link',
  draft: 'Draft',
  dotStamp: 'Dot Stamp',
  tickStamp: 'Tick Stamp',
  crossStamp: 'Cross Stamp',
  arc: 'Arc',
};

export const AnnotationSubTypes = {
  HIGHLIGHT_COMMENT: 'Highlight Comment',
};

export const DocumentHeight = {
  Mobile: 72,
  Desktop: 96,
};

export const DOCUMENT_TYPE = {
  ORGANIZATION: 'ORGANIZATION',
  PERSONAL: 'PERSONAL',
  ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
  // we will separate FOLDER type into a new object later
  FOLDER: 'FOLDER',
};

export const CurrentTypeMapping = {
  [folderType.INDIVIDUAL]: DOCUMENT_TYPE.PERSONAL,
  [folderType.TEAMS]: DOCUMENT_TYPE.ORGANIZATION_TEAM,
  [folderType.ORGANIZATION]: DOCUMENT_TYPE.ORGANIZATION,
};

export const DocumentActions = {
  View: 'View',
  Open: 'Open',
  MakeACopy: 'MakeACopy',
  MarkFavorite: 'MarkFavorite',
  Rename: 'Rename',
  CopyLink: 'CopyLink',
  Share: 'Share',
  Move: 'Move',
  Remove: 'Remove',
  MakeOffline: 'MakeOffline',
  ShareSetting: 'Share setting',
  UploadToLumin: 'Upload to Lumin',
  Merge: 'Merge',
  /**
   * @deprecated deprecated action, we don't use it anymore
   */
  CreateAsTemplate: 'Create as Template',
};

export const DocumentTemplateActions = {
  PreviewTemplate: 'Preview Template',
  UseTemplate: 'Use Template',
  EditTemplate: 'Edit Template',
  DeleteTemplate: 'Delete Template',
  CopyLinkTemplate: 'Copy Link Template',
};

export const DocumentRole = {
  OWNER: 'owner',
  SHARER: 'sharer',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  SPECTATOR: 'spectator',
};

export const REMOVE_UPLOAD_ICON_TIMEOUT = 3000;
export const MINIMUM_DOCUMENT_QUANTITY = 60;
export const DOCUMENT_SIDEBAR_SECTION = {
  PERSONAL_TEAMS: 'personal_teams',
  ORGANIZATION_LIST: 'organization_list',
};

export const MOBILE_BACK_TO_TOP_TRIGGER_AT = 135;

export const OPENED_BY = {
  MANAGER: 'manager',
  OTHER: 'other',
};

export const ACCOUNTABLE_BY = {
  PERSONAL: 'personal',
  ORGANIZATION: 'organization',
};

export const PDF_EXTENSION = '.pdf';
export const MAX_LENGTH_DOCUMENT_NAME = 255;
export const MAX_LENGTH_DROPBOX_NAME = MAX_LENGTH_DOCUMENT_NAME - PDF_EXTENSION.length;
export const MAX_LENGTH_REQUEST_UPGRADE_REASON = 255;

export const MAX_SIZE_UPLOAD_DOCUMENT = {
  FREE: 20,
  PAID: 200,
};

export const DELETE_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const SHARE_LINK_TYPE = {
  ANYONE: 'ANYONE',
  INVITED: 'INVITED',
};

export const TOTAL_DOCUMENT_DUMMY = 6;

export const MAX_TRUNCATED_FOLDER_NAME = 15;
export const DOCUMENT_STATUS = {
  SAVING: 'Saving...',
  UPDATED: 'All updates saved to Lumin',
  UPDATED_OFFLINE: 'All updates are saved to this device',
};

export const NEW_LAYOUT_DOCUMENT_STATUS = {
  LAST_UPDATE: 'Last update',
};

export const TRANSLATED_DOCUMENT_STATUS = {
  [SAVE_OPERATION_STATUS.SAVING]: 'viewer.header.saving',
  [SAVE_OPERATION_STATUS.SUCCESS]: 'viewer.header.savedToLumin',
  [SAVE_OPERATION_STATUS.OFFLINE]: 'viewer.header.savedToLocal',
};

export const ANNOTATION_STYLE = {
  FONT: 'Font',
  FONT_SIZE: 'FontSize',
  TEXT_COLOR: 'TextColor',
  STROKE_COLOR: 'StrokeColor',
  FILL_COLOR: 'FillColor',
  FONT_STYLE: 'FontStyle',
  OPACITY: 'Opacity',
  STROKE_THICKNESS: 'StrokeThickness',
};

export const DOCUMENT_DRAG_WITHOUT_SELECT = 1;

export const MOVABLE_ANNOTATION = [
  AnnotationSubjectMapping.freehand,
  AnnotationSubjectMapping.freetext,
  AnnotationSubjectMapping.signature,
  AnnotationSubjectMapping.stickyNote,
  AnnotationSubjectMapping.stamp,
  AnnotationSubjectMapping.draft,
  AnnotationSubjectMapping.line,
  AnnotationSubjectMapping.polygon,
  AnnotationSubjectMapping.polyline,
  AnnotationSubjectMapping.ellipse,
  AnnotationSubjectMapping.rectangle,
  AnnotationSubjectMapping.star,
  AnnotationSubjectMapping.tick,
  AnnotationSubjectMapping.cross,
  AnnotationSubjectMapping.freehandHighlight,
  AnnotationSubjectMapping.crossStamp,
  AnnotationSubjectMapping.dotStamp,
  AnnotationSubjectMapping.tickStamp,
  AnnotationSubjectMapping.arc,
];

export const CUSTOM_ANNOTATION = {
  STAR: { name: 'star', subject: 'Star', tool: 'AnnotationCreateStar' },
  CROSS: { name: 'cross', subject: 'Cross', tool: 'AnnotationCreateCross' },
  TICK: { name: 'tick', subject: 'Tick', tool: 'AnnotationCreateTick' },
  DETECTED_FIELD_PLACEHOLDER: {
    name: 'detectedFieldPlaceholder',
    subject: 'DetectedFieldPlaceholder',
    tool: '',
  },
};

export const TEXT_TOOLS = [
  AnnotationSubjectMapping.highlight,
  AnnotationSubjectMapping.squiggly,
  AnnotationSubjectMapping.underline,
  AnnotationSubjectMapping.strikeout,
];

export const PageToolViewMode = {
  GRID: 'Grid',
  LIST: 'Single',
};

export const CUSTOM_ANNOTATION_MIN_SIZE = 10;

export const BULK_UPDATE_LIST_TITLE = {
  MEMBER_LIST: 'member_list',
  INVITED_LIST: 'invited_list',
};
export const BULK_UPDATE_LIST = {
  [BULK_UPDATE_LIST_TITLE.INVITED_LIST]: {
    value: BULK_UPDATE_LIST_TITLE.INVITED_LIST,
    text: 'People invited list',
  },
  [BULK_UPDATE_LIST_TITLE.MEMBER_LIST]: {
    value: BULK_UPDATE_LIST_TITLE.MEMBER_LIST,
    text: 'Member list',
  },
};

export const DOCUMENT_OFFLINE_STATUS = {
  AVAILABLE: 'Offline Available',
  UNAVAILABLE: 'Offline Unavailable',
  DOWNLOADING: 'Downloading',
};

export const DOCUMENT_OFFLINE_STATUS_TEXT_MAPPING = {
  [DOCUMENT_OFFLINE_STATUS.AVAILABLE]: 'Make unavailable offline',
  [DOCUMENT_OFFLINE_STATUS.UNAVAILABLE]: 'Make available offline',
  [DOCUMENT_OFFLINE_STATUS.DOWNLOADING]: 'Downloading...',
};

export const COLLAPSE_LIST = {
  DOCUMENT: 'document',
  TEMPLATE: 'template',
  TEAM: 'team',
};

export const POPPER_PERMISSION_TYPE = {
  EDITOR: {
    value: DocumentRole.EDITOR,
    textRequestModal: 'modalShare.askOwnerToBeEditor',
    text: 'action.edit',
  },
  SHARER: {
    value: DocumentRole.SHARER,
    textRequestModal: 'modalShare.askOwnerToBeSharer',
    text: 'common.share',
  },
  VIEWER: {
    value: DocumentRole.VIEWER,
    textRequestModal: 'modalShare.askOwnerToBeCommentor',
    text: 'action.comment',
  },
};

export const MAX_REQUEST_ACCESS_ITEMS = 3;

export const ANNOTATION_ACTION = {
  ADD: 'add',
  MODIFY: 'modify',
  DELETE: 'delete',
  DESELECTED: 'deselected',
  SELECTED: 'selected',
};

export const ANNOTATION_SELECTED_ACTION = {
  SELECTED: 'selected',
  DESELECTED: 'deselected',
};

export const ANNOTATION_CHANGE_SOURCE = {
  REDACTION_APPLIED: 'redactionApplied',
  REORDER_APPLIED: 'reorderApplied',
  AUTO_RESIZED: 'autoResized',
  UPLOAD_SIGNED_URL: 'uploadSignedUrl',
  CONTENT_EDIT_TOOL: 'contentEditTool',
  PAGES_UPDATED: 'pagesUpdated',
  DRAGGING_ACROSS_PAGES: 'draggingAcrossPages',
  MOVE: 'move',

  /**
   * Custom source for Apryse annotationChanged event's options
   */
  LUMIN_UNDO_PAGES_DELETED: 'luminUndoPagesDeleted',
};

export const DocumentTab = {
  MY_DOCUMENT: 'MY_DOCUMENT',
  ORGANIZATION: 'ORGANIZATION',
  SHARED_WITH_ME: 'SHARED_WITH_ME',
  STARRED: 'STARRED',
  RECENT: 'RECENT',
  TRENDING: 'TRENDING',
};

export const UploadDocFormField = {
  THUMBNAIL_REMOTE_ID: 'thumbnailRemoteId',
  CLIENT_ID: 'clientId',
  DOCUMENT_ID: 'documentId',
  FILE_REMOTE_ID: 'fileRemoteId',
  FOLDER_ID: 'folderId',
  FILE_NAME: 'fileName',
  UPLOAD_DATA: 'encodedUploadData',
};

export const PERCENT_TO_NEARLY_HIT_DOC_STACK = 0.9;

export const TOTAL_DOC_STACK_FREE_ORG = 3;

// unit is MB
export const MAX_SIZE_MERGE_DOCUMENT = {
  PAID: 200,
  FREE: 20,
};

export const DEFAULT_BOOKMARK_TITLE = 'viewer.noteContent.untitled';

export const DEFAULT_OUTLINE_EXTRA_PADDING = 10;

export const MAX_TRUNCATE_DOCUMENT_NAME = {
  MOBILE: 64,
  DESKTOP: 84,
};

export const DEFAULT_FREE_TEXT_MIN_WIDTH = 30;

export const COMMENT_PANEL_LAYOUT_STATE = {
  NORMAL: 'NORMAL',
  PUSH_LEFT_SIDE: 'PUSH_LEFT_SIDE',
  ON_DOCUMENT: 'ON_DOCUMENT',
};

export const DOCUMENT_RESTORE_ORIGINAL_PERMISSION = {
  NOT_ALLOWED: 'NOT_ALLOWED',
  VIEW: 'VIEW',
  RESTORE: 'RESTORE',
};

export const CoreBundleNeedTrackEvent = [
  'core/webviewer-core.min.js',
  'core/pdf/pdfnet.res',
  'core/pdf/PDFNet.js',
  'core/pdf/PDFworker.js',
];
export const MAX_ANNOTATIONS_COPY_QUANTITY = 20;
// eslint-disable-next-line no-magic-numbers
export const MAX_ANNOTATIONS_COPY_SIZE = 3 * 1024 * 1024; // bytes ~ 3mb
export const DOCUMENT_CONTENT_EDIT_TYPE = {
  FULL_VERSION: 'full',
  LIMIT_VERSION: 'editTextOnly',
};

export const ANNOTATION_SUBJECT_MUST_BE_CONVERTED_TO_SIGNED_URL = [
  AnnotationSubjectMapping.stamp,
  AnnotationSubjectMapping.signature,
];

export const ANNOTATION_SUBJECT_NEED_TO_TRANSFORM = [
  AnnotationSubjectMapping.freetext,
  AnnotationSubjectMapping.stamp,
  AnnotationSubjectMapping.signature,
  AnnotationSubjectMapping.draft,
  AnnotationSubjectMapping.dotStamp,
  AnnotationSubjectMapping.tickStamp,
  AnnotationSubjectMapping.crossStamp,
];

export const DOCUMENT_ANNOTATION_TYPE = {
  RUBBER_STAMP: 'RUBBER_STAMP',
};

export const DocumentFromSourceEnum = {
  USER_UPLOAD: 'USER_UPLOAD',
  LUMIN_TEMPLATES_LIBRARY: 'LUMIN_TEMPLATES_LIBRARY',
};

export const PDF_ACTION_TYPE = {
  MOUSE_RELEASED: 'U',
};

export const FreeTextHandleColor = {
  R: 255,
  G: 255,
  B: 255,
};

export const DefaultHandleColor = {
  R: 70,
  G: 144,
  B: 164,
};

export const AnnotationOutlineColor = {
  R: 123,
  G: 144,
  B: 164,
};

export const TextHandleColor = {
  R: 70,
  G: 144,
  B: 164,
};

export const CommentOutlineColor = {
  R: 3,
  G: 89,
  B: 112,
};

export const DefaultSelectionOutlineColor = {
  R: 70,
  G: 144,
  B: 164,
};

export const URL_MAX_LENGTH = 2048;

export const REMOVE_HIGHLIGHT_FOUND_DOCUMENT_TIMEOUT = 6000;

export const DocumentTabMapping = {
  [folderType.INDIVIDUAL]: DocumentTab.MY_DOCUMENT,
  [folderType.TEAMS]: DocumentTab.ORGANIZATION,
  [folderType.ORGANIZATION]: DocumentTab.ORGANIZATION,
  [folderType.SHARED]: DocumentTab.SHARED_WITH_ME,
  [folderType.STARRED]: DocumentTab.STARRED,
};

export const DOCUMENT_KIND = {
  TEMPLATE: 'TEMPLATE',
  DOCUMENT: 'DOCUMENT',
} as const;
