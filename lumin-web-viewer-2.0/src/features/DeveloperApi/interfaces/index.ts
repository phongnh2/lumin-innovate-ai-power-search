export interface OAuth2Client {
  id: string;
  clientId: string;
  clientName: string;
  redirectUris: string[];
  owner: {
    id: string;
    name: string;
  };
  workspaceId: string;
  logoUri: string;
  privacyPolicyUrl: string;
  termsOfUseUrl: string;
  websiteUrl: string;
  applicationType: ApplicationType;
  scopes: Scope[];
  contactEmail: string;
  clientSecret?: string;
  createdAt: string;
  webhookUrl?: string;
  signingSecret?: string;
  previewLogo?: {
    fileId: string;
    src: string;
    expiresAt?: number;
  };
}

export enum ApplicationType {
  SERVER_APPLICATION = 'server_application',
  CLIENT_APPLICATION = 'client_application',
}

export enum Scope {
  OPEN_ID = 'openid',
  PROFILE_READ = 'profile.read',
  PROFILE_SETTINGS = 'profile.settings',
  PDF_FILES = 'pdf:files',
  PDF_FILES_READ = 'pdf:files.read',
  SIGN_REQUEST = 'sign:requests',
  SIGN_REQUEST_READ = 'sign:requests.read',
  TEMPLATES = 'templates',
  WORKSPACES_READ = 'workspaces.read',
  OFFLINE_ACCESS = 'offline_access',
  AGREEMENTS = 'agreements',
}
