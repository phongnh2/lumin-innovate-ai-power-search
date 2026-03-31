import { Injectable } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  FrontendApi, IdentityApi, Configuration,
  Session,
  IdentityCredentialsOidcProvider,
  Identity,
  ProjectApi,
  OrganizationBody as OryOrganizationBody,
  Organization as OryOrganization,
  Project,
  ListOrganizationsResponse,
} from '@ory/client';
import axios from 'axios';
import { createHash } from 'crypto';
import { get } from 'lodash';
import { customAlphabet } from 'nanoid';
import { v4 as uuid } from 'uuid';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { MANUAL_ORG_URL_LENGTH } from 'Common/constants/OrganizationConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LoginService } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { User } from 'User/interfaces/user.interface';

import { SamlSsoConnection, ScimSsoClient } from './kratos.interface';

@Injectable()
export class KratosService {
  private _kratosClient: FrontendApi = null;

  private _kratosAdmin: IdentityApi = null;

  private readonly _oryNetworkConfig: Configuration = null;

  private readonly _oryProject: ProjectApi = null;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {
    this._kratosClient = new FrontendApi(
      new Configuration({
        basePath: this.environmentService.getByKey(EnvConstants.KRATOS_PUBLIC_URL),
        baseOptions: {
          headers: {
            Connection: 'keep-alive',
          },
        },
      }),
    );

    this._kratosAdmin = new IdentityApi(
      new Configuration({
        basePath: this.environmentService.getByKey(EnvConstants.KRATOS_ADMIN_URL),
        baseOptions: {
          headers: {
            Authorization: `Bearer ${this.environmentService.getByKey(EnvConstants.ORY_PAT)}`,
            Connection: 'keep-alive',
          },
        },
      }),
    );

    this._oryNetworkConfig = new Configuration({
      basePath: this.environmentService.getByKey(EnvConstants.ORY_NETWORK_API_URL),
      baseOptions: {
        headers: {
          Authorization: `Bearer ${this.environmentService.getByKey(EnvConstants.ORY_WORKSPACE_API_KEY)}`,
        },
      },
    });

    this._oryProject = new ProjectApi(this._oryNetworkConfig);
  }

  get kratosClient(): FrontendApi {
    return this._kratosClient;
  }

  get kratosAdmin(): IdentityApi {
    return this._kratosAdmin;
  }

  get oryProject(): ProjectApi {
    return this._oryProject;
  }

  public async validateIdentity(identityId: string, email: string): Promise<boolean> {
    try {
      const { data: identity } = await this.kratosAdmin.getIdentity({ id: identityId });
      return identity.traits.email === email;
    } catch (err) {
      return false;
    }
  }

  async deleteIdentityByEmail(email: string): Promise<void> {
    try {
      const { data: identities } = await this.kratosAdmin.listIdentities({ credentialsIdentifier: email });
      if (!identities.length) {
        return;
      }
      const { id, traits } = identities[0];

      if (traits.email === email) {
        await this.kratosAdmin.deleteIdentity({ id });
      }
    } catch (err) {
      this.loggerService.error({
        context: this.deleteIdentityByEmail.name,
        error: this.loggerService.getCommonErrorAttributes(err),
      });
    }
  }

  async deleteUserIdentity(user: User): Promise<boolean> {
    try {
      if (user.identityId) {
        await this.kratosAdmin.deleteIdentity({ id: user.identityId });
        return true;
      }
      const { data: identities } = await this.kratosAdmin.listIdentities({ credentialsIdentifier: user.email });
      if (!identities.length) {
        return false;
      }
      if (identities[0].traits.email !== user.email) {
        return false;
      }
      await this.kratosAdmin.deleteIdentity({ id: identities[0].id });
    } catch (err) {
      this.loggerService.error({
        context: this.deleteUserIdentity.name,
        error: this.loggerService.getCommonErrorAttributes(err),
      });
      if (err.response.status === 429) {
        throw new Error('Too many requests');
      }
      return false;
    }
    return true;
  }

  async getValidSessionByIdentityId(identityId: string): Promise<Session[]> {
    try {
      const { data: sessions } = await this.kratosAdmin.listIdentitySessions({ id: identityId });
      return sessions.filter((session) => session.active);
    } catch (err) {
      this.loggerService.error({
        context: this.getValidSessionByIdentityId.name,
        error: this.loggerService.getCommonErrorAttributes(err),
      });
      return [];
    }
  }

  /**
   * Revoke all sessions for an identity by deleting them from Kratos
   */
  async revokeAllSessionsForIdentity(identityId: string): Promise<void> {
    const context = this.revokeAllSessionsForIdentity.name;
    try {
      const activeSessions = await this.getValidSessionByIdentityId(identityId);
      const sessionIds = activeSessions.map((session) => session.id);

      this.loggerService.info({
        message: '[revokeAllSessionsForIdentity] Revoking all sessions for identity',
        context,
        extraInfo: {
          identityId,
          sessionCount: sessionIds.length,
        },
      });

      await this.kratosAdmin.deleteIdentitySessions({ id: identityId });

      this.loggerService.info({
        message: '[revokeAllSessionsForIdentity] Successfully revoked all sessions',
        context,
        extraInfo: {
          identityId,
          revokedSessionCount: sessionIds.length,
        },
      });
    } catch (err) {
      this.loggerService.error({
        message: '[revokeAllSessionsForIdentity] Error revoking sessions',
        context,
        extraInfo: { identityId },
        error: this.loggerService.getCommonErrorAttributes(err),
      });
    }
  }

  getCurrentIdentityCredentialOidc(identity: Identity, loginService: LoginService): IdentityCredentialsOidcProvider {
    const oidcProviders = (get(identity, 'credentials.oidc.config.providers') as unknown as IdentityCredentialsOidcProvider[]) || [];
    const currentProvider = loginService.toLowerCase();
    const currentCredential = oidcProviders.find(({ provider }) => provider === currentProvider);
    return currentCredential;
  }

  async upsertOryOrganization(payload: OryOrganizationBody, organizationId?: string): Promise<OryOrganization> {
    const projectId = this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID);
    if (organizationId) {
      const { data: organization } = await this.oryProject.updateOrganization({
        projectId,
        organizationId,
        organizationBody: payload,
      });
      return organization;
    }

    const { data: organization } = await this.oryProject.createOrganization({
      projectId,
      organizationBody: payload,
    });
    return organization;
  }

  async getOryOrganization(id: string): Promise<OryOrganization> {
    const { data: organizationResp } = await this.oryProject.getOrganization({
      projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      organizationId: id,
    });
    return organizationResp.organization;
  }

  async deleteOryOrganization(id: string): Promise<void> {
    await this.oryProject.deleteOrganization({
      projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      organizationId: id,
    });
  }

  async getSamlSsoConnection({
    organizationId,
    project,
  }: {
    organizationId: string;
    project?: Project;
  }): Promise<{
    samlSsoConnectionIndex: number;
    samlSsoConnection: SamlSsoConnection | null;
  }> {
    let _project = project;
    if (!_project) {
      const { data: projectData } = await this.oryProject.getProject({
        projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      });
      _project = projectData;
    }
    const samlSsoConnections = get(_project, 'services.identity.config.selfservice.methods.saml.config.providers') as {
      id: string;
      organization_id: string;
      label: string;
      mapper_url: string;
      raw_idp_metadata_xml: string;
    }[];
    const samlSsoConnectionIndex = samlSsoConnections.findIndex(({ organization_id: orgId }) => orgId === organizationId);
    if (samlSsoConnectionIndex === -1) {
      return {
        samlSsoConnectionIndex: -1,
        samlSsoConnection: null,
      };
    }
    const ssoConnection = samlSsoConnections[samlSsoConnectionIndex];

    const { data: rawIdpMetadataXmlContent } = await axios.get(ssoConnection.raw_idp_metadata_xml);

    const ascUrl = this.environmentService.getByKey(EnvConstants.ORY_SAML_SSO_ASC_URL);
    const spEntityId = this.environmentService.getByKey(EnvConstants.ORY_SAML_SSO_SP_ENTITY_ID_BASE_URL);
    const samlSsoConnection = {
      id: ssoConnection.id,
      organizationId: ssoConnection.organization_id,
      label: ssoConnection.label,
      mapperUrl: ssoConnection.mapper_url,
      rawIdpMetadataXml: rawIdpMetadataXmlContent,
      ascUrl,
      spEntityId: `${spEntityId}/${organizationId}`,
    };

    return {
      samlSsoConnectionIndex,
      samlSsoConnection,
    };
  }

  async upsertSamlSsoConnection({
    organizationId,
    rawIdpMetadataXml,
  }: {
    organizationId: string;
    rawIdpMetadataXml: string;
  }): Promise<SamlSsoConnection> {
    try {
      let isUpdate = false;
      const { samlSsoConnectionIndex } = await this.getSamlSsoConnection({ organizationId });
      if (samlSsoConnectionIndex !== -1) {
        isUpdate = true;
      }
      const nanoId = customAlphabet(
        CommonConstants.ALPHABET_CHARACTERS,
        MANUAL_ORG_URL_LENGTH,
      );
      const providerId = nanoId();
      const label = `SAML org-${organizationId}`;
      const { data: patchedProject } = await this.oryProject.patchProject({
        projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
        jsonPatch: [
          {
            op: 'replace',
            path: '/services/identity/config/selfservice/methods/saml/enabled',
            value: true,
          },
          {
            op: isUpdate ? 'replace' : 'add',
            path: isUpdate
              ? `/services/identity/config/selfservice/methods/saml/config/providers/${samlSsoConnectionIndex}`
              : '/services/identity/config/selfservice/methods/saml/config/providers/-',
            value: {
              organization_id: organizationId,
              id: providerId,
              label,
              mapper_url: this.environmentService.getByKey(EnvConstants.ORY_SAML_SSO_DATA_MAPPING),
              raw_idp_metadata_xml: rawIdpMetadataXml,
            },
          },
        ],
      });
      const { project } = patchedProject;
      const { samlSsoConnection } = await this.getSamlSsoConnection({
        organizationId,
        project,
      });
      return samlSsoConnection;
    } catch (error) {
      this.loggerService.error({
        context: this.upsertSamlSsoConnection.name,
        error: this.loggerService.getCommonErrorAttributes(error),
      });
      throw error;
    }
  }

  async deleteSamlSsoConnection(organizationId: string): Promise<void> {
    const { samlSsoConnectionIndex } = await this.getSamlSsoConnection({ organizationId });
    if (samlSsoConnectionIndex === -1) {
      return;
    }
    await this.oryProject.patchProject({
      projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      jsonPatch: [
        {
          op: 'remove',
          path: `/services/identity/config/selfservice/methods/saml/config/providers/${samlSsoConnectionIndex}`,
        },
      ],
    });
  }

  async getScimSsoClient({
    organizationId,
    project,
  }: {
    organizationId: string;
    project?: Project;
  }): Promise<{
    scimSsoClientIndex: number;
    scimSsoClient: ScimSsoClient | null;
  }> {
    let _project = project;
    if (!_project) {
      const { data: projectData } = await this.oryProject.getProject({
        projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      });
      _project = projectData;
    }
    const scimSsoClients = get(_project, 'services.identity.config.scim.clients', []) as {
      id: string;
      organization_id: string;
      label: string;
      authorization_header_secret: string;
      mapper_url: string;
    }[];
    const scimSsoClientIndex = scimSsoClients.findIndex(({ organization_id: orgId }) => orgId === organizationId);
    if (scimSsoClientIndex === -1) {
      return {
        scimSsoClientIndex: -1,
        scimSsoClient: null,
      };
    }
    const scimSsoClient = scimSsoClients[scimSsoClientIndex];

    const scimServerUrlTemplate = this.environmentService.getByKey(EnvConstants.ORY_SCIM_SSO_SERVER_URL_TEMPLATE);
    const scimServerUrl = scimServerUrlTemplate.replace('#{oryOrganizationId}', scimSsoClient.id);

    return {
      scimSsoClientIndex,
      scimSsoClient: {
        id: scimSsoClient.id,
        organizationId: scimSsoClient.organization_id,
        label: scimSsoClient.label,
        authorizationHeaderSecret: scimSsoClient.authorization_header_secret,
        mapperUrl: scimSsoClient.mapper_url,
        scimServerUrl,
      },
    };
  }

  async upsertScimSsoClient(organizationId: string): Promise<ScimSsoClient> {
    let isUpdate = false;
    const { scimSsoClientIndex } = await this.getScimSsoClient({ organizationId });
    if (scimSsoClientIndex !== -1) {
      isUpdate = true;
    }
    const serverId = uuid();
    const label = `SCIM org-${organizationId}`;
    const authorizationHeaderSecretHash = createHash('sha256').update(`${organizationId}-${serverId}`).digest('hex');
    const { data: patchedProject } = await this.oryProject.patchProject({
      projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      jsonPatch: [
        {
          op: isUpdate ? 'replace' : 'add',
          path: isUpdate
            ? `/services/identity/config/scim/clients/${scimSsoClientIndex}`
            : '/services/identity/config/scim/clients/-',
          value: {
            organization_id: organizationId,
            id: serverId,
            label,
            authorization_header_secret: `Bearer ${authorizationHeaderSecretHash}`,
            mapper_url: this.environmentService.getByKey(EnvConstants.ORY_SCIM_SSO_DATA_MAPPING),
          },
        },
      ],
    });
    const { project } = patchedProject;
    const { scimSsoClient } = await this.getScimSsoClient({
      organizationId,
      project,
    });

    return scimSsoClient;
  }

  async deleteScimSsoClient(organizationId: string): Promise<void> {
    const { scimSsoClientIndex } = await this.getScimSsoClient({ organizationId });
    if (scimSsoClientIndex === -1) {
      return;
    }
    await this.oryProject.patchProject({
      projectId: this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID),
      jsonPatch: [
        {
          op: 'remove',
          path: `/services/identity/config/scim/clients/${scimSsoClientIndex}`,
        },
      ],
    });
  }

  async getOryOrganizationByDomain(domain: string): Promise<ListOrganizationsResponse> {
    const oryProjectId = this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID);
    if (!oryProjectId) {
      return {
        organizations: [],
        has_next_page: false,
        next_page_token: '',
      };
    }
    const { data: listOrganizationsResponse } = await this.oryProject.listOrganizations({
      projectId: oryProjectId,
      domain,
    });
    return listOrganizationsResponse;
  }

  async getIdentityById(identityId: string): Promise<Identity> {
    const { data: identity } = await this.kratosAdmin.getIdentity({ id: identityId });
    return identity;
  }
}
