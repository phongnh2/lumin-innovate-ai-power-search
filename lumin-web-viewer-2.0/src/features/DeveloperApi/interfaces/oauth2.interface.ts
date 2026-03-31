import { ApplicationType, Scope } from '.';

export interface CreateOAuth2ClientParams {
  clientName: string;
  redirectUris: string[];
  applicationType: ApplicationType;
  scopes: Scope[];
  file: File;
  websiteUrl: string;
  privacyPolicyUrl: string;
  termsOfUseUrl: string;
  contactEmail: string;
  workspaceId: string;
  webhookUrl?: string;
}

export interface OAuth2ClientResponse {
  id: string;
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    name: string;
  };
  workspace_id: string;
  logo_uri: string;
  policy_uri: string;
  tos_uri: string;
  contact_email: string;
  website_url: string;
  application_type: ApplicationType;
  scopes: Scope[];
  client_secret?: string;
  webhook_url?: string;
  signing_secret?: string;
}

export interface GetListOAuth2ClientParams {
  workspaceId: string;
}
