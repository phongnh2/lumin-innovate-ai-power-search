import Axios from '@libs/axios';

import { OAuth2Client } from '../interfaces';
import {
  CreateOAuth2ClientParams,
  GetListOAuth2ClientParams,
  OAuth2ClientResponse,
} from '../interfaces/oauth2.interface';

const OAUTH2_PATH = {
  OAUTH2_CLIENT: {
    BASE: 'oauth2-client',
    CREATE: 'create',
    LIST: 'list',
    REGENERATE_SECRET: 'regenerate_secret/:id',
    REGENERATE_SIGNING_SECRET: 'regenerate_signing_secret/:id',
    CHANGE_LOGO: 'change_logo/:id',
    GET: ':id',
    DELETE: ':id',
    UPDATE: 'update/:id',
    GET_LOGO: 'logo',
  },
};

export const createOAuth2Client = async (params: CreateOAuth2ClientParams): Promise<OAuth2Client> => {
  const {
    clientName,
    redirectUris,
    applicationType,
    scopes,
    file,
    websiteUrl,
    privacyPolicyUrl,
    termsOfUseUrl,
    contactEmail,
    workspaceId,
    webhookUrl,
  } = params;
  const formData = new FormData();
  formData.append('client_name', clientName);
  redirectUris.forEach((uri, idx) => {
    formData.append(`redirect_uris[${idx}]`, uri);
  });
  formData.append('application_type', applicationType);
  scopes.forEach((scope, idx) => {
    formData.append(`scopes[${idx}]`, scope);
  });
  formData.append('file', file);
  formData.append('website_url', websiteUrl);
  formData.append('privacy_policy_url', privacyPolicyUrl);
  formData.append('terms_of_use_url', termsOfUseUrl);
  formData.append('contact_email', contactEmail);
  formData.append('workspace_id', workspaceId);
  if (webhookUrl) {
    formData.append('webhook_url', webhookUrl);
  }

  const response = await Axios.axiosDeveloperApiInstance.post<OAuth2ClientResponse>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.CREATE}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    id: response.data.id,
    clientId: response.data.client_id,
    clientName: response.data.client_name,
    redirectUris: response.data.redirect_uris,
    owner: response.data.owner,
    workspaceId: response.data.workspace_id,
    logoUri: response.data.logo_uri,
    privacyPolicyUrl: response.data.policy_uri,
    termsOfUseUrl: response.data.tos_uri,
    websiteUrl: response.data.website_url,
    scopes: response.data.scopes,
    contactEmail: response.data.contact_email,
    applicationType: response.data.application_type,
    clientSecret: response.data.client_secret,
    createdAt: response.data.created_at,
    webhookUrl: response.data.webhook_url,
    signingSecret: response.data.signing_secret,
  };
};

export const getListOAuth2Clients = async (params: GetListOAuth2ClientParams): Promise<OAuth2Client[]> => {
  const response = await Axios.axiosDeveloperApiInstance.get<OAuth2ClientResponse[]>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.LIST}?workspace_id=${params.workspaceId}`
  );

  return response.data.map((client) => ({
    id: client.id,
    clientId: client.client_id,
    clientName: client.client_name,
    redirectUris: client.redirect_uris,
    owner: client.owner,
    workspaceId: client.workspace_id,
    logoUri: client.logo_uri,
    privacyPolicyUrl: client.policy_uri,
    termsOfUseUrl: client.tos_uri,
    websiteUrl: client.website_url,
    scopes: client.scopes,
    contactEmail: client.contact_email,
    applicationType: client.application_type,
    createdAt: client.created_at,
    webhookUrl: client.webhook_url,
    signingSecret: client.signing_secret,
  }));
};

export const deleteOAuth2Client = async ({ id }: { id: string }) => {
  await Axios.axiosDeveloperApiInstance.delete(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.DELETE.replace(':id', id)}`
  );
};

export const rotateOAuth2ClientSecret = async ({ id }: { id: string }): Promise<OAuth2Client> => {
  const response = await Axios.axiosDeveloperApiInstance.post<OAuth2ClientResponse>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.REGENERATE_SECRET.replace(':id', id)}`
  );

  return {
    id: response.data.id,
    clientId: response.data.client_id,
    clientName: response.data.client_name,
    redirectUris: response.data.redirect_uris,
    owner: {
      id: response.data.owner.id,
      name: response.data.owner.name,
    },
    workspaceId: response.data.workspace_id,
    logoUri: response.data.logo_uri,
    privacyPolicyUrl: response.data.policy_uri,
    termsOfUseUrl: response.data.tos_uri,
    websiteUrl: response.data.website_url,
    applicationType: response.data.application_type,
    scopes: response.data.scopes,
    contactEmail: response.data.contact_email,
    clientSecret: response.data.client_secret,
    createdAt: response.data.created_at,
    webhookUrl: response.data.webhook_url,
    signingSecret: response.data.signing_secret,
  };
};

export const rotateOAuth2SigningSecret = async ({ id }: { id: string }): Promise<OAuth2Client> => {
  const response = await Axios.axiosDeveloperApiInstance.put<OAuth2ClientResponse>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.REGENERATE_SIGNING_SECRET.replace(':id', id)}`
  );

  return {
    id: response.data.id,
    clientId: response.data.client_id,
    clientName: response.data.client_name,
    redirectUris: response.data.redirect_uris,
    owner: {
      id: response.data.owner.id,
      name: response.data.owner.name,
    },
    workspaceId: response.data.workspace_id,
    logoUri: response.data.logo_uri,
    privacyPolicyUrl: response.data.policy_uri,
    termsOfUseUrl: response.data.tos_uri,
    websiteUrl: response.data.website_url,
    applicationType: response.data.application_type,
    scopes: response.data.scopes,
    contactEmail: response.data.contact_email,
    clientSecret: response.data.client_secret,
    createdAt: response.data.created_at,
    webhookUrl: response.data.webhook_url,
    signingSecret: response.data.signing_secret,
  };
};

export const changeOAuth2ClientLogo = async ({ id, file }: { id: string; file: File }): Promise<OAuth2Client> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await Axios.axiosDeveloperApiInstance.patch<OAuth2ClientResponse>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.CHANGE_LOGO.replace(':id', id)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return {
    id: response.data.id,
    clientId: response.data.client_id,
    clientName: response.data.client_name,
    redirectUris: response.data.redirect_uris,
    owner: response.data.owner,
    workspaceId: response.data.workspace_id,
    logoUri: response.data.logo_uri,
    privacyPolicyUrl: response.data.policy_uri,
    termsOfUseUrl: response.data.tos_uri,
    websiteUrl: response.data.website_url,
    applicationType: response.data.application_type,
    scopes: response.data.scopes,
    contactEmail: response.data.contact_email,
    clientSecret: response.data.client_secret,
    createdAt: response.data.created_at,
    webhookUrl: response.data.webhook_url,
    signingSecret: response.data.signing_secret,
  };
};

export const updateOAuth2Client = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<OAuth2Client>;
}): Promise<OAuth2Client> => {
  const response = await Axios.axiosDeveloperApiInstance.patch<OAuth2ClientResponse>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.UPDATE.replace(':id', id)}`,
    {
      client_name: data.clientName,
      redirect_uris: data.redirectUris,
      scopes: data.scopes,
      website_url: data.websiteUrl,
      privacy_policy_url: data.privacyPolicyUrl,
      terms_of_use_url: data.termsOfUseUrl,
      contact_email: data.contactEmail,
      webhook_url: data.webhookUrl,
    }
  );

  return {
    id: response.data.id,
    clientId: response.data.client_id,
    clientName: response.data.client_name,
    redirectUris: response.data.redirect_uris,
    workspaceId: response.data.workspace_id,
    logoUri: response.data.logo_uri,
    privacyPolicyUrl: response.data.policy_uri,
    termsOfUseUrl: response.data.tos_uri,
    websiteUrl: response.data.website_url,
    applicationType: response.data.application_type,
    scopes: response.data.scopes,
    contactEmail: response.data.contact_email,
    clientSecret: response.data.client_secret,
    createdAt: response.data.created_at,
    owner: response.data.owner,
    webhookUrl: response.data.webhook_url,
    signingSecret: response.data.signing_secret,
  };
};

export const getOAuth2ClientLogo = async ({
  fileId,
  signal,
}: {
  fileId: string;
  signal?: AbortSignal;
}): Promise<{
  url: string;
  expiresAt: number;
}> => {
  const response = await Axios.axiosDeveloperApiInstance.get<{ url: string; expires_at: number }>(
    `/${OAUTH2_PATH.OAUTH2_CLIENT.BASE}/${OAUTH2_PATH.OAUTH2_CLIENT.GET_LOGO}?file_id=${fileId}`,
    {
      signal,
    }
  );

  return {
    url: response.data.url,
    expiresAt: response.data.expires_at,
  };
};
