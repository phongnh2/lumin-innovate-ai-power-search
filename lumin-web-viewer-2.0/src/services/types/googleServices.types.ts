export type GoogleImplicitAccessToken = {
  access_token: string;
  email: string;
  scope: string;
  userRemoteId: string;
};

export type GoogleOAuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};

export type GooglePermission = {
  emailAddress: string;
};

export type DriveFileInfo = {
  size: string;
  name: string;
  mimeType: string;
  createdTime: string;
  lastModified: string;
  permissions: GooglePermission[];
  parents: string[];
  capabilities?: {
    canDownload?: boolean;
    canModifyContent?: boolean;
  };
  id: string;
};
