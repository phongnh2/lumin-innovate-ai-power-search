import { LoginService } from 'graphql.schema';

export interface SamlSsoConnection {
  id: string;
  organizationId: string;
  label: string;
  mapperUrl: string;
  rawIdpMetadataXml: string;
  ascUrl: string;
  spEntityId: string;
}

export interface ScimSsoClient {
  id: string;
  organizationId: string;
  label: string;
  authorizationHeaderSecret: string;
  mapperUrl: string;
  scimServerUrl: string;
}

export interface Traits {
  name: string;
  email: string;
  avatarRemoteId?: string;
  sub?: string;
  loginService?: LoginService;
}
