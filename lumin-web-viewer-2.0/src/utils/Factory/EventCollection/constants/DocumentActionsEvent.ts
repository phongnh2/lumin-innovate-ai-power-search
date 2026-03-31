export enum ActionName {
  MERGE = 'merge',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  MOVE = 'move',
}

export enum QuickAction {
  MAKE_A_COPY = 'makeACopy',
  SHARE = 'share',
  COPY_LINK = 'copyLink',
  MORE_ACTIONS = 'moreActions',
}

export enum ErrorType {
  INSUFFICIENT_DOC_STACK = 'insufficient doc stack',
  EXCEEDED_FILE_LIMIT = 'exceeded the file limit',
  TOO_MANY_FILES_SELECTED = 'too many files selected',
  DOCUMENT_EXPIRED = 'document expired',
  DOCUMENT_PERMISSION_DENIED = 'document permission denied',
  DOCUMENT_SECURED = 'document secured',
  INCORRECT_UPLOADED_ACCOUNT = 'incorrect uploaded account',
  INSUFFICIENT_DOWNLOAD_PERMISSIONS = 'insufficient download permissions',
  ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS = 'original file deleted or insufficient permissions',
  BLOCK_POPUP = 'block popup',
  ACCESS_DENIED = 'access denied',
  UNKNOWN = 'unknown',
  ERROR_GETTING_DOCUMENT_DATA = 'error getting document data',
  ERROR_CHECKING_CONDITIONS = 'error checking conditions',
}

export enum ObjectType {
  DOC = 'doc',
  FOLDER = 'folder',
}

export enum DocumentDropdownAction {
  FILE_INFO = 'fileInfo',
  OPEN = 'open',
  UPLOAD_TO_LUMIN = 'uploadToLumin',
  COPY_DOC = 'copyDoc',
  RENAME = 'rename',
  COPY_LINK = 'copyLink',
  SHARE = 'share',
  STAR = 'star',
  MOVE = 'move',
  DELETE = 'delete',
  SIGN_SECURELY = 'signSecurely',
  DOWNLOAD = 'download',
  MAKE_OFFLINE = 'makeOffline',
}
