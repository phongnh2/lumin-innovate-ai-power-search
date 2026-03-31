/* eslint-disable max-classes-per-file */
import { drive_v3 as DriveV3 } from '@googleapis/drive';
import { HttpStatus } from '@nestjs/common';
import { CookieOptions, Response, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { merge } from 'lodash';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { SOCKET_MESSAGE } from 'Common/constants/SocketConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';
import UserRules from 'CustomRules/UserRules';

import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { TESTING_URL } from 'constant';
import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocument } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { ThirdPartyService } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { IOneDriveFile } from 'OpenOneDrive/interfaces/File.interface';
import { OrganizationService } from 'Organization/organization.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

type TCookieValue = { value: string, options?: Omit<CookieOptions, 'maxAge' | 'sameSite'> & {
  maxAge: number, sameSite?: boolean | 'lax' | 'strict' | 'none' } };

export type TCookiesResult = Record<string, TCookieValue>;

export type OpenFileReturn = { nextUrl: string;
  statusCode: HttpStatus;
  cookies?: TCookiesResult;}

export type InputType = {
  oauth2Client?: OAuth2Client;
  extra: {
    accessToken: string;
    fileId?: string;
    options?: Omit<DriveV3.Params$Resource$Files$Get, 'fileId'>;
    remoteFilePath?: string;
  };
}
abstract class AbstractOpenFileBase {
  public abstract getRemoteFile(input: InputType): Promise<{
    file: DriveV3.Schema$File | IOneDriveFile,
    error?: Error;
  }>;

  public abstract getWrongAccountUrl({
    email, host, url, from,
  }:{host: string, url: string, email: string, from?: string}): string;
}

class OpenFileBase extends AbstractOpenFileBase {
  private readonly cryptoKey: string;

  constructor(
    protected readonly environmentService: EnvironmentService,
    protected readonly documentService: DocumentService,
    protected readonly userService: UserService,
    protected readonly loggerService: LoggerService,
    protected readonly organizationService: OrganizationService,
    protected readonly whitelistIpService: WhitelistIPService,
    protected readonly customRulesService: CustomRulesService,
    protected readonly customRuleLoader: CustomRuleLoader,
    protected readonly messageGateway: EventsGateway,
  ) {
    super();
    this.cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  public getRemoteFile(input: InputType): Promise<{
    file: DriveV3.Schema$File | IOneDriveFile,
    error?: Error;
  }> {
    throw new Error('Method not implemented.');
  }

  private isDevelopment(): boolean {
    return this.environmentService.getByKey(EnvConstants.ENV) === 'development';
  }

  encryptData<TPayload>(payload: TPayload): string {
    return Utils.encryptData(JSON.stringify(payload), this.cryptoKey);
  }

  decryptData<TReturn>(payload: string): TReturn {
    return JSON.parse(Utils.decryptData(payload, this.cryptoKey));
  }

  private getBaseUrl(): string {
    return this.environmentService.getByKey(EnvConstants.BASE_URL);
  }

  private getBackendUrl(): string {
    return this.environmentService.getByKey(EnvConstants.APP_BACKEND_URL);
  }

  getUrl({ path, host, query = {} }: {
    path: string,
    host: string,
    query?: Record<string, unknown>
  }): string {
    const search = new URLSearchParams();
    Object.keys(query).forEach((_key) => {
      const value = query[_key];
      search.append(_key, typeof value !== 'string' ? JSON.stringify(value) : value);
    });
    const qString = search.toString();
    const url = new URL(path, host);
    return [url.toString(), qString].filter(Boolean).join('?');
  }

  public getViewerUrl(host: string, documentId: string): string {
    const origins = this.getLuminOrigins(host);
    const path = `/viewer/${documentId}`;
    return this.getUrl({
      path,
      host: origins.viewer,
    });
  }

  getLuminOrigins(host: string): { backend: string, viewer: string } {
    const baseUrl = this.getBaseUrl();
    if (this.isDevelopment()) {
      return {
        backend: this.getBackendUrl(),
        viewer: baseUrl,
      };
    }
    const { origin } = new URL('/', `https://${host}`);
    const url = origin === TESTING_URL ? TESTING_URL : baseUrl;
    return {
      backend: url,
      viewer: url,
    };
  }

  public getTechnicalIssueUrl(host: string, oauthUrl: string): string {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: '/technical-issue',
      host: origins.viewer,
      query: {
        next_url: encodeURIComponent(oauthUrl),
      },
    });
  }

  public getWrongAccountUrl({
    // eslint-disable-next-line unused-imports/no-unused-vars
    email, host, url, from,
  }:{host: string, url: string, email: string, from?: string}): string {
    throw new Error('Method not implemented.');
  }

  getCookieOptions(options: Omit<CookieOptions, 'maxAge' | 'sameSite'> & {
    maxAge: number; sameSite?: boolean | 'lax' | 'strict' | 'none' }): CookieOptions {
    const mergeObject = merge(
      {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      },
      this.isDevelopment() ? {} : { secure: true, domain: '.luminpdf.com' },
      options,
    );
    return mergeObject;
  }

  setCookie(res: Response, cookies?: TCookiesResult): void {
    if (!cookies) {
      return;
    }
    Object.entries(cookies).forEach(([key, data]) => {
      res.cookie(key, data.value, this.getCookieOptions(data.options));
    });
  }

  async createDriveDocument({
    user, file, remoteEmail, documentService, mimeType, externalStorageAttributes, accessToken,
  }:{
    user: User,
    file: DriveV3.Schema$File | IOneDriveFile,
    remoteEmail: string,
    documentService: ThirdPartyService,
    mimeType: string,
    externalStorageAttributes?: Record<string, unknown>,
    accessToken?: string,
  }): Promise<{
    error?: GraphErrorException,
    document?: IDocument,
  }> {
    const document = await this.documentService.getDocumentByRemoteId(
      file.id,
      user._id,
    );
    const documentPermission = document?._id ? await this.documentService.getDocumentPermissionByConditions({
      documentId: document._id,
      refId: user._id,
      role: DocumentRoleEnum.OWNER,
    }) : [];
    if (document && documentPermission.length) {
      const { workspace } = documentPermission[0];
      if (workspace) {
        this.userService.updateLastAccessedOrg(user._id, workspace.refId.toHexString());
      }
      return { document };
    }

    // auto add member to org if same unpopular domain with inviter
    await this.organizationService.addUserToOrgsWithSameDomain(user).catch((error) => {
      this.loggerService.error({
        error,
        context: this.organizationService.addUserToOrgsWithSameDomain.name,
      });
    });

    const destinationOrg = await this.documentService.updateWorkspaceAndGetUploadDestination(user, { fromOpenFileFlow: true });
    const { error: uploadError, documents } = await this.documentService.createThirdPartyDocuments(
      user,
      {
        documents: [{
          remoteId: file.id,
          name: file.name,
          size: Number(file.size),
          mimeType,
          service: documentService,
          remoteEmail,
          externalStorageAttributes,
        }],
        clientId: user._id,
      },
      destinationOrg,
      accessToken,
    );

    if (uploadError) {
      return { error: uploadError };
    }
    return { document: documents[0] as unknown as IDocument };
  }

  async getNextUrlForRestrictedUser(user: User, request: Request): Promise<{
    error?: {
      code: string;
      message: string;
      extra: {
        email: string;
      }
    },
    response?: OpenFileReturn,
  }> {
    const { headers } = request;
    const nextUrlForIpValidation = this.getNextUrlForIpValidation(user, request);
    if (nextUrlForIpValidation) {
      return nextUrlForIpValidation;
    }
    if (user) {
      const getNextUrlForOrgMembershipValidation = await this.getNextUrlForOrgMembershipValidation(user, headers.host);
      if (getNextUrlForOrgMembershipValidation) {
        return getNextUrlForOrgMembershipValidation;
      }
    }

    return {};
  }

  getNextUrlForIpValidation(user: User, request: Request): {
    error?: {
      code: string;
      message: string;
      extra: {
        email: string;
      }
    },
    response?: OpenFileReturn,
  } {
    const { headers } = request;
    const { error } = this.whitelistIpService.validateIPRequest({
      isGraphqlRequest: false, email: user.email, ipAddress: Utils.getIpRequest({ headers }),
    });
    if (error) {
      return {
        error: {
          code: 'ip_address_blocked',
          message: error.message,
          extra: {
            email: user.email,
          },
        },
        response: {
          nextUrl: this.getWrongIpUrl(headers.host, user.email),
          statusCode: HttpStatus.SEE_OTHER,
        },
      };
    }

    return {};
  }

  async getNextUrlForOrgMembershipValidation(user: User, host: string): Promise<{
    error?: {
      code: string;
      message: string;
      extra: {
        email: string;
      }
    },
    response?: OpenFileReturn,
  }> {
    const userRules = new UserRules(this.customRulesService, this.customRuleLoader, user);
    if (userRules.requireOrgMembershipOnSignIn) {
      try {
        const userDomain = Utils.getEmailDomain(user.email);
        await this.customRulesService.verifyOrgMembership({ orgId: userRules.orgId, user, domain: userDomain });
      } catch (err) {
        return {
          error: {
            code: 'membership_required',
            message: err.message,
            extra: {
              email: user.email,
            },
          },
          response: {
            nextUrl: this.getRequireOrgMembershipUrl(host, user.email),
            statusCode: HttpStatus.SEE_OTHER,
          },
        };
      }
    }

    return {};
  }

  getRequireOrgMembershipUrl(host: string, email: string): string {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: '/technical-issue',
      host: origins.viewer,
      query: {
        require_org_membership: true,
        email,
      },
    });
  }

  getWrongIpUrl(host: string, email: string): string {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: '/technical-issue',
      host: origins.viewer,
      query: {
        wrong_email: email,
      },
    });
  }

  getWrongMimeTypeUrl(host: string, metaData: { nextUrl: string }): string {
    const { nextUrl } = metaData;
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: nextUrl || '/documents/personal',
      host: origins.viewer,
      query: {
        open_google_state: 'wrong_mime_type',
      },
    });
  }

  getBrowserPreferedLanguage(request: Request): string {
    const headersLanguage: string = request.headers['accept-language'];
    if (!headersLanguage) {
      return 'en-US';
    }
    let preferedLanguage = headersLanguage.split(',')[0];
    if (preferedLanguage.includes(';')) {
      [preferedLanguage] = preferedLanguage.split(';');
    }
    return preferedLanguage;
  }

  emitReloadMessage(anonymousUserId: string): void {
    this.messageGateway.server.to(`user-room-${anonymousUserId}`).emit(SOCKET_MESSAGE.FORCE_RELOAD);
  }
}
export { OpenFileBase };
