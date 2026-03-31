import { DriveType } from './oneDrive.constants';

/* eslint-disable sonarjs/no-duplicate-string */
export interface IFilePickerOptions {
  sdk: '8.0';
  messaging: IMessagingConfiguration;
  entry: IEntryConfiguration;
  telemetry?: ITelemetryConfiguration;
  // authentication: IAuthenticationConfiguration;
  localization?: ILocalizationConfiguration;

  /**
   * Specifies what types of items may be picked and where they come from.
   */
  typesAndSources?: ITypesAndSourcesConfiguration;
  /**
   * Specified how many items may be picked.
   */
  selection?: ISelectionConfiguration;
  /**
   * Specifies what happens when users pick files and what the user may do with files in the picker.
   */
  commands?: ICommandConfiguration;
  /**
   * Specifies accessibility cues such as auto-focus behaviors.
   */
  accessibility?: IAccessibilityConfiguration;
  search?: {
    enabled: boolean;
  };
}

/**
 * Establishes the messaging parameters used to setup the post message communications between
 * picker and host application
 */
interface IMessagingConfiguration {
  /**
   * A unique id assigned by the host app to this File Picker instance.
   */
  channelId: string;
  /**
   * The host app's authority, used as the target origin for post-messaging.
   */
  origin: string;
}

/**
 * Configuration for the entry location to which the File Picker will navigate on load.
 * The File Picker app will prioritize path-based navigation if provided, falling back to other address forms
 * on error (in case of Site redirection or content rename) or if path information is not provided.
 */
interface IEntryConfiguration {
  sharePoint?: {
    /**
     * Specify an exact SharePoint content location by path segments.
     */
    byPath?: {
      /**
       * Full URL to the root of a Web, or server-relative URL.
       * @example
       *  'https://contoso-my.sharepoint.com/personal/user_contoso_com'
       * @example
       *  '/path/to/web'
       * @example
       *  'subweb'
       */
      web?: string;
      /**
       * Full URL or path segement to identity a List.
       * If not preceded with a `/` or a URL scheme, this is assumed to be a list in the specified web.
       * @example
       *  'Shared Documents'
       * @example
       *  '/path/to/web/Shared Documents'
       * @example
       *  'https://contoso.sharepoint.com/path/to/web/Shared Documents'
       */
      list?: string;
      /**
       * Path segment to a folder within a list, or a server-relative URL to a folder.
       * @example
       *  'General'
       * @example
       *  'foo/bar'
       * @example
       *  '/path/to/web/Shared Documents/General'
       */
      folder?: string;
    };
    /**
     * Indicates SharePoint ID values which may be used as a backup in case path-based navigation to the initial item fails.
     * Id-based lookup in SharePoint is slower, as should only be used as a last-resort.
     * The File Picker will return an error if only ID values are specified.
     */
    byId?: {
      webId?: string;
      listId?: string;
      uniqueId?: string;
    };
  };
  /**
   * Indicates that the File Picker should start in the user's OneDrive.
   */
  oneDrive?: {
    /**
     * Specifies that File Picker should start in the user's Files tab.
     */
    files?: {
      /**
       * Path segment for sub-folder within the user's OneDrive.
       * @example
       *  'Pictures'
       * @example
       *  '/personal/user_contoso_com/Documents/Attachments'
       */
      folder?: string;
    };
    /**
     * Indicates that File Picker should start in the user's recent files.
     */
    recent?: Record<string, unknown>;
    /**
     * Indicates that File Picker should start in the files shared with the user.
     */
    sharedWithMe?: Record<string, unknown>;
  };

  // TBD Specifying sort/group/filter/view settings.
}

interface ITelemetryConfiguration {
  /**
   * A unique id for the host app's session. Used for telemetry correlation between apps.
   */
  sessionId?: string;
  /**
   * Additional data to be included in all telemetry events, in the 'extraData' payloads.
   */
  extraData?: {
    [key: string]: string | number | boolean;
  };
}

interface ILocalizationConfiguration {
  /**
   * The language code from the Host application.
   * File Picker will render components which are not user content using the specified language.
   * If the backing SharePoint Web has an override language setting, some strings such as column headers will render
   * using the Web's language instead.
   */
  language: string;
}

/**
 * Configuration for what item types may be selected within the picker and returned to the host.
 */
interface ISelectionConfiguration {
  /**
   * @default 'single'
   */
  mode?: 'single' | 'multiple' | 'pick';
  maxCount?: number;
}

interface ITypesAndSourcesConfiguration {
  /**
   * Specifies the general category of items picked. Switches between 'file' vs. 'folder' picker mode,
   * or a general-purpose picker.
   * @default 'all'
   */
  mode?: 'files' | 'folders' | 'all';
  /**
   * @default `['folder']` if `itemTypes` is 'folders', otherwise `[]`
   */
  filters?: string[];

  /**
   * Configures whether or not specific pivots may be browsed for content by the user.
   */
  pivots?: {
    recent?: boolean;
    oneDrive?: boolean;
    sharedLibraries?: boolean;
    shared?: boolean;
    search?: boolean;
  };
}

interface IAccessibilityConfiguration {
  focusTrap?: 'initial' | 'always' | 'none';
}

interface ICommandConfiguration {
  /**
   * Sets the default 'pick' behavior once the user selects items.
   */
  pick?: {
    action: 'select' | 'share' | 'download' | 'move';
    /**
     * A custom label to apply to the button to pick the items.
     * The default varies based on `action`, but is typically 'Select'.
     * This string must be localized if provided.
     */
    label?: string;
  };
  close?: {
    /**
     * A custom label to apply to the button to close the picker.
     * The default is 'Cancel'.
     * This string must be localized if provided.
     */
    label?: string;
  };
  /**
   * Behavior for "Upload"
   */
  upload?: {
    // Default is true
    enabled?: boolean;
  };
  /**
   * Behavior for "Create folder"
   */
  createFolder?: {
    // Default is true
    enabled?: boolean;
  };
}

export interface INotificationData {
  code: string;
  isExpected: boolean;
  message: string;
  notification: string;
  timestamp: number;
}

export interface IPickData {
  command: 'pick';
  items: SPItem[];
  keepSharing: false;
}

export interface SPItem {
  '@sharePoint.embedUrl': string;
  '@sharePoint.endpoint': string;
  '@sharePoint.listUrl': string;
  folder?: any;
  id: string;
  name: string;
  parentReference: {
    driveId: string;
    sharepointIds: {
      listId: string;
      siteId: string;
      siteUrl: string;
      webId: string;
    };
  };
  sharepointIds: {
    listId: string;
    listItemId: string;
    listItemUniqueId: string;
    siteId: string;
    siteUrl: string;
    webId: string;
  };
  size: number;
  webDavUrl: string;
  webUrl: string;
  file: {
    mimeType: string;
  };
}

export interface OnedriveFileInfo {
  '@microsoft.graph.downloadUrl': string;
  '@odata.context': string;
  cTag: string;
  eTag: string;
  file: {
    mimeType: string;
  };
  fileSystemInfo: {
    createdDateTime: string;
    lastModifiedDateTime: string;
  };
  id: string;
  name: string;
  parentReference: {
    driveId: string;
    driveType: string;
    id: string;
    path: string;
  };
  size: number;
  webUrl: string;
}

export type OneDriveUserInfo = {
  '@odata.context': string;
  createdBy: {
    user: Record<string, string>;
  };
  createdDateTime: string;
  description: string;
  driveType: DriveType;
  id: string;
  lastModifiedBy: {
    user: Record<string, string>;
  };
  lastModifiedDateTime: string;
  owner: {
    user: Record<string, string>;
  };
  quota: {
    deleted: number;
    remaining: number;
    state: string;
    total: number;
    used: number;
  };
  name: string;
  webUrl: string;
};

export type OneDriveSiteInfo = {
  '@odata.context': string;
  createdDateTime: string;
  description: string;
  displayName: string;
  id: string;
  lastModifiedDateTime: string;
  root: Record<string, any>;
  siteCollection: {
    hostname: string;
  };
  name: string;
  webUrl: string;
};

export type PickedOnedriveFileInfo = {
  id: string;
  name: string;
  webUrl: string;
  parentReference: {
    driveId: string;
  };
};

export type GetFileBaseInputs = {
  remoteId: string;
  driveId: string;
  name: string;
  mimeType: string;
};

export type UploadFileBaseInputs = {
  remoteId?: string;
  fileName?: string;
  driveId?: string;
  folderId?: string;
  file: Blob;
};

type ThumbnailDetails = {
  height: number;
  width: number;
  url: string;
};

export type GetListThumbnailsResponse = {
  '@odata.context': string;
  value: {
    small: ThumbnailDetails;
    medium: ThumbnailDetails;
    large: ThumbnailDetails;
  }[];
};

export type MessageData = {
  data: {
    command: string;
    items: Record<string, unknown>[];
    resource: string;
  };
  type: string;
  id: string;
};

export type OneDriveBrowserError = {
  correlationId: string;
  errorCode: string;
  errorMessage: string;
  name: string;
  subError: string;
};

export type OneDriveAxiosError = {
  code: string;
  message: string;
  name: string;
  response: {
    status: number;
    data: {
      error: {
        code: string;
        innerError: Record<string, string>;
        localizedMessage: string;
        message: string;
      };
    };
  };
};

export enum OneDriveFileRole {
  Owner = 'owner',
  Write = 'write',
}

export type OneDriveSiteUserInfo = {
  siteUser: {
    displayName: string;
    email: string;
  };
};

export type OneDriveFilePermission = {
  roles: OneDriveFileRole[];
  grantedToV2?: OneDriveSiteUserInfo;
  grantedToIdentitiesV2?: OneDriveSiteUserInfo[];
};

export enum OneDrivePickerModes {
  FILES = 'files',
  FOLDERS = 'folders',
}
