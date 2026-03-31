export type FindLocationPath = {
  _id: string;
  name: string;
  path: FindLocationPath;
};

export type FindLocationData = {
  _id: string;
  name: string;
  avatarRemoteId: string;
  path: FindLocationPath;
};

export type UploadDocumentWithThumbnailToS3Params = {
  thumbnail?: File;
  file: File;
  remoteId?: string;
  thumbnailRemoteId?: string;
  signal?: AbortSignal;
  uploadDocFrom?: UploadDocFrom;
};

export type UploadFileToS3Params = {
  file: File | Blob;
  presignedUrl: string;
  headers?: Record<string, string>;
  options?: {
    signal: AbortSignal;
  };
};

export type PromptInviteGoogleUsersParams = {
  orgId: string;
  accessToken?: string;
  googleAuthorizationEmail?: string;
  forceUpdate?: boolean;
  shareEmails?: string;
};

export type PromptInviteUsersBannerResponse = {
  orgId?: string;
  bannerType: string;
  inviteUsers: {
    _id: string;
    name: string;
    email: string;
    avatarRemoteId: string;
  }[];
};

export enum UploadDocFrom {
  EditPdf = 'EditPdf',
}
