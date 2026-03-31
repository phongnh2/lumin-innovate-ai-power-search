/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Configuration, IdTokenClaims, LogLevel, PublicClientApplication,
} from '@azure/msal-node';
import {
  forwardRef, HttpStatus, Inject, Injectable,
} from '@nestjs/common';
import { Session } from '@ory/client';
import { Request, Response } from 'express';
import * as moment from 'moment';
import { v4 as uuidV4 } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import {
  AuthenticationStatus, CommonOpenFlowCookie, OneDrivePermission, OpenOneDriveCookie,
} from 'Common/constants/OpenFlowFileConstants';
import { NotAcceptException } from 'Common/errors/graphql/NotAcceptException';
import { OpenOneDriveFile } from 'Common/template-methods/OpenFileFlow';
import { TCookiesResult } from 'Common/template-methods/OpenFileFlow/open-file-base';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';

import { AuthService } from 'Auth/auth.service';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { LUMIN_AUTHENTICATION_COOKIE_NAME, TESTING_URL } from 'constant';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { LoginService, ThirdPartyService } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { UserService } from 'User/user.service';

import { IOneDriveRedirectState, IRedirectOneDriveDTO } from './dtos/OpenOneDrive.dto';
import { EventTrackingService } from './EventTracking/EventTracking.service';
import { OpenOneDriveErrorCode } from './interfaces/common.interface';

@Injectable()
export class OpenOneDriveService {
  private readonly _oneDriveHandler: OpenOneDriveFile;

  private readonly _oauth2ClientFromNewApp: PublicClientApplication;

  private readonly _oauth2ClientFromDefaultApp: PublicClientApplication;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly organizationService: OrganizationService,
    private readonly whitelistIpService: WhitelistIPService,
    private readonly customRulesService: CustomRulesService,
    private readonly customRuleLoader: CustomRuleLoader,
    @Inject(forwardRef(() => EventTrackingService))
    private readonly eventTrackingService: EventTrackingService,
    private readonly messageGateway: EventsGateway,
  ) {
    this._oneDriveHandler = this.initOneDriveHanler();
    this._oauth2ClientFromNewApp = this.createOauth2(this.getNewAppConfig());
    this._oauth2ClientFromDefaultApp = this.createOauth2(this.getDefaultAppConfig());
  }

  private initOneDriveHanler() {
    return new OpenOneDriveFile(
      this.environmentService,
      this.documentService,
      this.userService,
      this.loggerService,
      this.organizationService,
      this.whitelistIpService,
      this.customRulesService,
      this.customRuleLoader,
      this.messageGateway,
    );
  }

  setCookie(response: Response, cookies: TCookiesResult) {
    this._oneDriveHandler.setCookie(response, cookies);
  }

  private isDevelopment(): boolean {
    return this.environmentService.getByKey(EnvConstants.ENV) === 'development';
  }

  private createOauth2({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
    const config: Configuration = {
      auth: {
        clientId,
        authority: 'https://login.microsoftonline.com/common',
        clientSecret,
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel: LogLevel, message: string) {
            if (loglevel === LogLevel.Error) {
              this.loggerService.info({
                context: 'OpenOneDriveService:createOauth2',
                error: message,
              });
            }
          },
          piiLoggingEnabled: false,
          logLevel: LogLevel.Verbose,
        },
      },
    };
    return new PublicClientApplication(config);
  }

  private getDefaultAppConfig() {
    return {
      clientId: this.environmentService.getByKey(EnvConstants.MICROSOFT_CLIENT_ID),
      clientSecret: this.environmentService.getByKey(EnvConstants.MICROSOFT_CLIENT_SECRET),
    };
  }

  private getNewAppConfig() {
    return {
      clientId: this.environmentService.getByKey(EnvConstants.MICROSOFT_ADD_INS_CLIENT_ID),
      clientSecret: this.environmentService.getByKey(EnvConstants.MICROSOFT_ADD_INS_CLIENT_SECRET),
    };
  }

  getOauth2ClientByUserEmail(email: string) {
    const isWhitelistedUser = this.userService.checkOneDriveAddInsWhitelisted(email);

    return {
      oauth2Client: isWhitelistedUser
        ? this._oauth2ClientFromNewApp
        : this._oauth2ClientFromDefaultApp,
    };
  }

  encryptData<TPayload>(payload: TPayload): string {
    return this._oneDriveHandler.encryptData(payload);
  }

  decryptData<TReturn>(payload: string): TReturn {
    return this._oneDriveHandler.decryptData(payload);
  }

  createMicrosoftOauthUrl({
    state, options = {},
  }: { state: IOneDriveRedirectState, options?: Record<string, unknown> }): Promise<string> {
    const { oauth2Client } = this.getOauth2ClientByUserEmail(state.userId);
    const { host, ...stateRemaining } = state;
    const { origin } = new URL('/', `https://${host}`);
    const authCodeUrlParameters = {
      scopes: [
        OneDrivePermission.Email,
        OneDrivePermission.FilesReadWriteAll,
        OneDrivePermission.Profile,
      ],
      redirectUri: `${origin === TESTING_URL ? TESTING_URL : this.environmentService.getByKey(EnvConstants.APP_BACKEND_URL)}/open/onedrive/redirect`,
      state: JSON.stringify(stateRemaining),
      ...options,
    };
    return oauth2Client.getAuthCodeUrl(authCodeUrlParameters);
  }

  async handleInitOneDriveFlow({
    items, userId: microsoftUserId, request, flowId,
  }: {
    items: string[], userId: string, request: Request, flowId: string,
  }): Promise<{
    nextUrl: string; cookies?: TCookiesResult; statusCode?: number;
  }> {
    const { cookies } = request;
    const onedriveAccessKey: string = cookies[OpenOneDriveCookie.OneDriveKey];
    const oneDriveAccessToken = await this.redisService.getRedisValueWithKey(`${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${onedriveAccessKey}`);
    if (!onedriveAccessKey || !oneDriveAccessToken) {
      const nextUrl = await this.createMicrosoftOauthUrl({
        state: { items, userId: microsoftUserId, flowId, host: request.headers.host },
        options: { loginHint: microsoftUserId },
      });
      return {
        nextUrl,
      };
    }
    const {
      accessToken, expiredAt, email, oid,
    } = this.decryptData<{
      accessToken: string, expiredAt: number, email: string, oid: string,
    }>(oneDriveAccessToken);
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    const extendedCookie = {};
    if (microsoftUserId && microsoftUserId !== email) {
      let session = null;
      if (!request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
        session = await this.authService.getAuthenticationToken(request.headers.cookie).catch(() => null);
      }
      if (request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
        session = await this.authService.verifyOryAuthenticationToken(cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] as string).catch(() => null);
      }
      if (session) {
        const revokeAuthenticationCookie = {
          value: '',
          options: {
            maxAge: 0,
          },
        };
        extendedCookie[LUMIN_AUTHENTICATION_COOKIE_NAME] = revokeAuthenticationCookie;
        extendedCookie[orySessionName] = revokeAuthenticationCookie;
        extendedCookie[OpenOneDriveCookie.OneDriveKey] = revokeAuthenticationCookie;
        await this.authService.revokeSession(session.id as string);
        this.eventTrackingService.trackError(
          request,
          { code: OpenOneDriveErrorCode.InvalidCredentials, message: 'Has different between cache userId and userId in url' },
        );
      }
      const nextUrl = await this.createMicrosoftOauthUrl({
        state: { items, userId: microsoftUserId, flowId, host: request.headers.host },
        options: { loginHint: microsoftUserId },
      });
      return {
        nextUrl,
        statusCode: HttpStatus.SEE_OTHER,
        cookies: {
          ...extendedCookie,
        },
      };
    }
    return this.validateAccessTokenHandler({
      accessToken, expiredAt, state: { items, userId: microsoftUserId, flowId }, oid, email,
    }, request);
  }

  async handleRedirectionOneDriveFlow({
    request, query,
  }: {
    request: Request, query: IRedirectOneDriveDTO,
  }): Promise<{ nextUrl: string; cookies?: TCookiesResult }> {
    const {
      state: redirectState, code, error: consentError, client_info: clientInfo,
    } = query;
    const userDenied = !code || consentError;
    const { cookies: requestCookie } = request;
    const onedriveAccessKey: string = requestCookie[OpenOneDriveCookie.OneDriveKey];
    const oneDriveAccessToken = await this.redisService.getRedisValueWithKey(`${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${onedriveAccessKey}`);
    if (oneDriveAccessToken && userDenied) {
      const {
        accessToken, expiredAt, email, oid,
      } = this.decryptData<{
          accessToken: string;
          expiredAt: number;
          email: string;
          oid: string;
        }>(oneDriveAccessToken);
      return this.validateAccessTokenHandler({
        accessToken,
        expiredAt,
        state: redirectState,
        oid,
        email,
      }, request);
    }
    if (userDenied) {
      this.eventTrackingService.trackError(request, { code: OpenOneDriveErrorCode.AccessDenied, message: consentError });
      const nextUrl = await this.createMicrosoftOauthUrl({ state: { ...redirectState, host: request.headers.host }, options: { loginHint: redirectState.userId } });
      return {
        nextUrl,
      };
    }
    const { oauth2Client } = this.getOauth2ClientByUserEmail(redirectState.userId);
    const { origin } = new URL('/', `https://${request.headers.host}`);
    const tokenRequest = {
      code,
      redirectUri: `${origin === TESTING_URL ? TESTING_URL : this.environmentService.getByKey(EnvConstants.APP_BACKEND_URL)}/open/onedrive/redirect`,
      scopes: [
        OneDrivePermission.Email,
        OneDrivePermission.FilesReadWriteAll,
        OneDrivePermission.Profile,
      ],
      clientInfo,
    };
    const response = await oauth2Client.acquireTokenByCode(tokenRequest);
    const idTokenClaims = response.idTokenClaims as IdTokenClaims & { email: string };
    const { nextUrl, cookies } = await this.validateAccessTokenHandler({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      accessToken: response.accessToken,
      expiredAt: Number(moment(response.expiresOn).format('x')),
      state: redirectState,
      oid: (response.idTokenClaims as IdTokenClaims).oid,
      email: (idTokenClaims?.email || idTokenClaims.preferred_username).toLowerCase(),
    }, request);
    return {
      nextUrl,
      cookies,
    };
  }

  async handleImportFileFromOneDrive({
    state, request,
  }: { state: IOneDriveRedirectState, request: Request
  }): Promise<{ nextUrl: string; cookies:TCookiesResult }> {
    const { items, userId: microsoftUserId, authStatus } = state;
    const encryptedAccessToken = await this.redisService.getRedisValueWithKey(
      `${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${request.cookies[OpenOneDriveCookie.OneDriveKey]}`,
    );
    const {
      accessToken, expiredAt, email,
    } = this.decryptData<{
        accessToken: string;
        expiredAt: number;
        email: string;
      }>(encryptedAccessToken) || {};
    if (authStatus && authStatus !== AuthenticationStatus.AUTHENTICATED) {
      this.eventTrackingService.trackAuthenticationEvent(authStatus, request);
    }
    if (!accessToken || (expiredAt < Date.now())) {
      await this.redisService.deleteRedisByKey(`${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${request.cookies[OpenOneDriveCookie.OneDriveKey]}`);
      const nextUrl = await this.createMicrosoftOauthUrl({ state: { ...state, host: request.headers.host }, options: { loginHint: email } });
      return {
        nextUrl,
        cookies: {
          [OpenOneDriveCookie.OneDriveKey]: {
            value: '',
            options: {
              maxAge: 0,
              sameSite: this.isDevelopment() ? 'lax' : 'none',
            },
          },
        },
      };
    }
    let session: Partial<Session> = null;
    let cookies = null;
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    if (!request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
      session = await this.authService.getAuthenticationToken(request.headers.cookie).catch(() => null);
      const authenCookieExpire = Number(this.environmentService.getByKey(EnvConstants.JWT_AUTHENTICATION_EXPIRE_IN));
      cookies = {
        [LUMIN_AUTHENTICATION_COOKIE_NAME]: {
          value: session.tokenized,
          options: {
            maxAge: authenCookieExpire * 1000,
          },
        },
      };
    }
    if (request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
      session = await this.authService.verifyOryAuthenticationToken(request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] as string).catch(() => null);
    }
    const [
      { file, error: oneDriveError },
      user,
    ] = await Promise.all([
      this._oneDriveHandler.getRemoteFile({
        extra: {
          accessToken,
          remoteFilePath: items[0],
        },
      }),
      this.userService.findUserByEmail(session.identity.traits.email as string),
    ]);
    if (oneDriveError || (user.email !== microsoftUserId)) {
      this.eventTrackingService.trackError(request, { code: OpenOneDriveErrorCode.WrongAccount });
      const url = await this.createMicrosoftOauthUrl({ state: { ...state, host: request.headers.host }, options: { prompt: 'select_account' } });
      const nextUrl = this._oneDriveHandler.getWrongAccountUrl({
        host: request.headers.host, email: user.email, url, from: 'oneDrive',
      });
      return {
        nextUrl,
        cookies: {
          ...cookies,
          [OpenOneDriveCookie.OneDriveKey]: {
            value: '',
            options: {
              maxAge: 0,
              sameSite: this.isDevelopment() ? 'lax' : 'none',
            },
          },
          ...(session && user.email !== microsoftUserId) && this.removeSessionCookie(),
        },
      };
    }
    const { document, error } = await this._oneDriveHandler.createDriveDocument({
      user,
      file,
      remoteEmail: email,
      mimeType: file.file.mimeType,
      documentService: ThirdPartyService.onedrive,
      externalStorageAttributes: {
        driveId: file.parentReference.driveId,
      },
    });
    if (error) {
      if (error && error instanceof NotAcceptException && error.extensions.code === ErrorCode.Common.INVALID_INPUT) {
        // Track wrong mimetype event
        const { nextUrl } = error.getMetadata();
        return {
          nextUrl: this._oneDriveHandler.getWrongMimeTypeUrl(request.headers.host, { nextUrl }),
          cookies,
        };
      }
      throw error;
    }
    return {
      nextUrl: this._oneDriveHandler.getViewerUrl(request.headers.host, document._id),
      cookies,
    };
  }

  async validateAccessTokenHandler(payload: {
    // oid: Object identifier, this ID uniquely identifies the user across applications of onedrive flow
    accessToken: string, expiredAt: number, state: IOneDriveRedirectState, oid: string, email: string,
  }, request: Request): Promise<{ nextUrl: string; cookies?: TCookiesResult}> {
    const {
      accessToken, expiredAt, state, oid, email,
    } = payload as { accessToken: string, expiredAt: number, state: IOneDriveRedirectState, oid: string, email: string };
    const { userId: hintEmail } = state;
    const responseObject = {
      statusCode: HttpStatus.SEE_OTHER,
      nextUrl: '',
      cookies: {},
    };
    if (!accessToken || (expiredAt <= Date.now())) {
      const onedriveAccessKey = request.cookies[OpenOneDriveCookie.OneDriveKey];
      if (onedriveAccessKey) {
        await this.redisService.deleteRedisByKey(`${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${onedriveAccessKey}`);
      }
      const nextUrl = await this.createMicrosoftOauthUrl({ state: { ...state, host: request.headers.host }, options: { loginHint: hintEmail } });
      return {
        ...responseObject,
        nextUrl,
        cookies: {
          [OpenOneDriveCookie.OneDriveKey]: {
            value: '',
            options: {
              maxAge: 0,
              sameSite: this.isDevelopment() ? 'lax' : 'none',
            },
          },
        },
      };
    }
    const { file, error } = await this._oneDriveHandler.getRemoteFile({ extra: { accessToken, remoteFilePath: state.items[0] } });
    if (error) {
      this.eventTrackingService.trackError(request, { code: OpenOneDriveErrorCode.WrongAccount });
      const onedriveAccessKey = request.cookies[OpenOneDriveCookie.OneDriveKey];
      if (onedriveAccessKey) {
        await this.redisService.deleteRedisByKey(`${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${onedriveAccessKey}`);
      }
      const url = await this.createMicrosoftOauthUrl({ state: {...state, host: request.headers.host }, options: { prompt: 'select_account' } });
      const nextUrl = this._oneDriveHandler.getWrongAccountUrl({
        host: request.headers.host, email, url, from: 'oneDrive',
      });
      return {
        ...responseObject,
        nextUrl,
        cookies: {
          [OpenOneDriveCookie.OneDriveKey]: {
            value: '',
            options: {
              maxAge: 0,
              sameSite: this.isDevelopment() ? 'lax' : 'none',
            },
          },
        },
      };
    }
    let session = null;
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    if (!request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
      session = await this.authService.getAuthenticationToken(request.headers.cookie).catch(() => null);
      if (session) {
        const authenCookieExpire = Number(this.environmentService.getByKey(EnvConstants.JWT_AUTHENTICATION_EXPIRE_IN));
        responseObject.cookies = {
          ...responseObject.cookies,
          [LUMIN_AUTHENTICATION_COOKIE_NAME]: {
            value: session.tokenized,
            options: {
              maxAge: authenCookieExpire * 1000,
            },
          },
        };
      }
    }
    if (request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
      session = await this.authService.verifyOryAuthenticationToken(request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] as string).catch(() => null);
    }
    const user = await this.userService.findUserByEmail(email);
    if (session && user) {
      if (session.identity.traits.email === email) {
        const importDocumentUrl = this.getImportDocumentUrl({
          state: { ...state, authStatus: AuthenticationStatus.AUTHENTICATED },
          host: request.headers.host,
        });
        if (session.identity.traits.loginService === LoginService.MICROSOFT) {
          const onedriveAccessKey = request.cookies[OpenOneDriveCookie.OneDriveKey] || uuidV4();
          this.redisService.setRedisDataWithExpireTime({
            key: `${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${onedriveAccessKey}`,
            value: this.encryptData({
              accessToken, expiredAt, email, oid,
            }),
            expireTime: 3600,
          });
          return {
            ...responseObject,
            nextUrl: importDocumentUrl,
            cookies: {
              [OpenOneDriveCookie.OneDriveKey]: {
                value: onedriveAccessKey,
                options: {
                  maxAge: 3600 * 1000,
                  sameSite: this.isDevelopment() ? 'lax' : 'none',
                },
              },
              [CommonOpenFlowCookie.InFlow]: {
                value: 'oneDrive',
                options: {
                  maxAge: 10 * 60 * 1000,
                  sameSite: 'strict',
                },
              },
              [CommonOpenFlowCookie.LoginHint]: {
                value: email,
                options: {
                  maxAge: 60000,
                },
              },
            },
          };
        }
        const authUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
        const destUrl = `${authUrl}/profile-settings?request_social_sign_in=${hintEmail}&provider=Microsoft&return_to=${encodeURIComponent(
          importDocumentUrl,
        )}`;
        return {
          ...responseObject,
          nextUrl: destUrl,
        };
      }
      responseObject.cookies = { ...this.removeSessionCookie(), ...responseObject.cookies };
      await this.authService.revokeSession(session.id as string);
    }
    if (!user || user.loginService === LoginService.MICROSOFT) {
      const kratosUrl = this.environmentService.getByKey(EnvConstants.KRATOS_PUBLIC_URL);
      const importDocumentUrl = this.getImportDocumentUrl({
        state: {
          ...state,
          authStatus: user
            ? AuthenticationStatus.SIGN_IN
            : AuthenticationStatus.SIGN_UP,
        },
        host: request.headers.host,
      });
      const destUrl = `${kratosUrl}/self-service/registration/browser?return_to=${encodeURIComponent(importDocumentUrl)}`;
      const onedriveAccessKey = request.cookies[OpenOneDriveCookie.OneDriveKey] || uuidV4();
      this.redisService.setRedisDataWithExpireTime({
        key: `${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${onedriveAccessKey}`,
        value: this.encryptData({
          accessToken, expiredAt, email, oid,
        }),
        expireTime: 3600,
      });
      return {
        ...responseObject,
        nextUrl: destUrl,
        cookies: {
          [OpenOneDriveCookie.OneDriveKey]: {
            value: onedriveAccessKey,
            options: {
              maxAge: 3600 * 1000,
              sameSite: this.isDevelopment() ? 'lax' : 'none',
            },
          },
          [CommonOpenFlowCookie.InFlow]: {
            value: 'oneDrive',
            options: {
              maxAge: 10 * 60 * 1000,
              sameSite: 'strict',
            },
          },
          [CommonOpenFlowCookie.LoginHint]: {
            value: email,
            options: {
              maxAge: 10 * 60 * 1000,
            },
          },
          ...this.removeSessionCookie(),
        },
      };
    }
    const {
      error: err,
      response: nextUrlForRestrictedUser,
    } = await this._oneDriveHandler.getNextUrlForRestrictedUser(user, request);
    if (err) {
      this.eventTrackingService.trackError(
        request,
        { code: err.code, message: err.message },
      );
    }
    if (nextUrlForRestrictedUser) {
      return nextUrlForRestrictedUser;
    }
    const searchParams = new URLSearchParams({
      storage: 'onedrive',
      drive_id: file.parentReference.driveId,
      'hint-login-service': user.loginService,
      state: JSON.stringify(state),
      hint_email: hintEmail,
    });
    const anonymousViewerUrl = this._oneDriveHandler.getAnonymousViewerUrl({
      remoteId: file.id,
      searchParams,
      host: request.headers.host,
    });
    responseObject.nextUrl = anonymousViewerUrl;
    return responseObject;
  }

  getImportDocumentUrl({
    state, host,
  }:{ state: IOneDriveRedirectState, host: string }): string {
    const origins = this._oneDriveHandler.getLuminOrigins(host);
    const postAuthUrl = this._oneDriveHandler.getUrl({
      path: '/open/onedrive/import-document',
      host: origins.backend,
    });
    const search = new URLSearchParams({ state: JSON.stringify(state) });
    const authUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
    const gateWay = `${authUrl}/authentication/gateway?redirect_to=`;
    return `${gateWay}${postAuthUrl}?${search.toString()}`;
  }

  async getTechnicalIssueUrl({
    host,
    payload,
    state,
  }: {
    host: string;
    payload?: {
      items: string[];
      userId: string;
      flowId: string;
    };
    state?: IOneDriveRedirectState;
  }): Promise<string> {
    let stateParams = state;
    if (!stateParams) {
      stateParams = payload;
    }
    const oauth2Url = await this.createMicrosoftOauthUrl({ state: { ...stateParams, host }, options: { prompt: 'select_account' } });
    return this._oneDriveHandler.getTechnicalIssueUrl(host, oauth2Url);
  }

  getLuminOrigins(host: string): { backend: string, viewer: string } {
    return this._oneDriveHandler.getLuminOrigins(host);
  }

  getBrowserPreferedLanguage(request: Request): string {
    return this._oneDriveHandler.getBrowserPreferedLanguage(request);
  }

  removeSessionCookie(): TCookiesResult {
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    const revokeAuthenticationCookie = {
      value: '',
      options: {
        maxAge: 0,
      },
    };
    return {
      [LUMIN_AUTHENTICATION_COOKIE_NAME]: revokeAuthenticationCookie,
      [orySessionName]: revokeAuthenticationCookie,
    };
  }

  getNavigationUrl({
    items, userId, host,
  }:{host: string, items: string[], userId: string}): string {
    const origins = this._oneDriveHandler.getLuminOrigins(host);
    const navigationUrl = this._oneDriveHandler.getUrl({
      path: '/open/onedrive/init',
      host: origins.backend,
    });
    const signature = JSON.stringify({ items, userId });
    return `${navigationUrl}?signature=${signature}`;
  }
}
