/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { drive, drive_v3 as DriveV3 } from '@googleapis/drive';
import {
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GenerateAuthUrlOpts, OAuth2Client, TokenInfo } from 'google-auth-library';
import { merge } from 'lodash';
import { v4 as uuid } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import {
  AuthenticationStatus,
  CommonOpenFlowCookie,
  GoogleScope,
  OpenGoogleCookie,
} from 'Common/constants/OpenFlowFileConstants';
import { popularDomains } from 'Common/constants/OrganizationConstants';
import { UrlSearchParam } from 'Common/constants/UrlSearchParam';
import { LOGIN_TYPE } from 'Common/constants/UserConstants';
import { NotAcceptException } from 'Common/errors/graphql/NotAcceptException';
import { OpenGoogleFile } from 'Common/template-methods/OpenFileFlow';
import { Utils } from 'Common/utils/Utils';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';
import UserRules from 'CustomRules/UserRules';

import { AuthService } from 'Auth/auth.service';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { LUMIN_AUTHENTICATION_COOKIE_NAME, TESTING_URL } from 'constant';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import {
  CredentialsFromOpenGooglePayload, LoginService,
  ThirdPartyService,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IGoogleRedirectState, IGoogleStateQuery } from 'OpenGoogle/dtos/OpenGoogle.dto';
import { EventTrackingService } from 'OpenGoogle/EventTracking.service';
import {
  OpenGoogleReturn,
  TCookieValue,
  TCookiesResult,
  TGoogleTokenPayload,
  TInitGoogleFlow,
  TPostAuthHandler,
  TRedirectGoogleFlow,
  TSignaturePayload,
  TValidateTokenHandler,
  OpenGoogleTokens,
} from 'OpenGoogle/interfaces/OpenGoogle.interface';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { OpenGoogleErrorCode, OpenGoogleErrorException } from './interfaces/OpenGoogleError.interface';

@Injectable()
export class OpenGoogleService {
  private openGoogleCookies: {
    googleAccessTokenCookie: string,
  };

  private _openGoogleHandler: OpenGoogleFile;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly organizationService: OrganizationService,
    private readonly documentService: DocumentService,
    private readonly whitelistIpService: WhitelistIPService,
    @Inject(forwardRef(() => EventTrackingService))
    private readonly eventTrackingService: EventTrackingService,
    private readonly customRulesService: CustomRulesService,
    private readonly customRuleLoader: CustomRuleLoader,
    private readonly messageGateway: EventsGateway,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
  ) {
    this.openGoogleCookies = this.loadGoogleCookieNames();
    this._openGoogleHandler = new OpenGoogleFile(
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

  private createOAuth2Client(origin: string): OAuth2Client {
    return new OAuth2Client(
      this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID),
      this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_SECRET),
      `${origin}/open/google/redirect`,
    );
  }

  private getDriveFileOptions(): Partial<DriveV3.Params$Resource$Files$Get> {
    return {
      supportsAllDrives: true,
      fields: 'id,name,size,mimeType,owners',
    };
  }

  encryptData<TPayload>(payload: TPayload): string {
    return this._openGoogleHandler.encryptData(payload);
  }

  decryptData<TReturn>(payload: string): TReturn {
    return this._openGoogleHandler.decryptData(payload);
  }

  getTokensCookie(req: Request): OpenGoogleTokens {
    const { googleAccessTokenCookie } = this.loadGoogleCookieNames();
    return {
      google: {
        accessTokenData: req.cookies[googleAccessTokenCookie],
      },
    };
  }

  createGoogleOauthUrl(
    payload: {
      origin: string,
      anonymousUserId: string,
      state: IGoogleStateQuery,
      options?: Pick<GenerateAuthUrlOpts, 'login_hint' | 'prompt'>,
      flowId: string,
      referer?: string,
    },
  ): string {
    const {
      state, options = {}, origin, flowId, referer,
    } = payload;
    const signature = this.encryptData<TSignaturePayload>({
      state, loginHint: options.login_hint, flowId, referer,
    });

    // Perform a `signature` to verify the redirect and the incoming request is same.
    const url = this.createOAuth2Client(origin).generateAuthUrl({
      access_type: 'online',
      state: JSON.stringify(<IGoogleRedirectState>{ signature }),
      scope: [
        GoogleScope.Email,
        GoogleScope.Profile,
        GoogleScope.DriveFile,
        GoogleScope.DriveInstall,
      ],
      include_granted_scopes: true,
      login_hint: options.login_hint || state.userId,
      prompt: options.prompt || '',
    });
    return url;
  }

  getViewerUrl(host: string, documentId: string, credentialsId: string, options?: {
    action?: string;
    from?: string;
    authStatus?: AuthenticationStatus;
  }, additionalParams?: URLSearchParams): string {
    const origins = this.getLuminOrigins(host);
    let path = `/viewer/${documentId}?credentials-id=${credentialsId}`;
    if (options.action) {
      path += `&action=${options.action}`;
    }
    if (options.from) {
      path += `&from=${options.from}`;
    }
    if (options.authStatus === AuthenticationStatus.SIGN_UP) {
      path += `&authStatus=${options.authStatus}`;
    }
    if (additionalParams) {
      path += `&${additionalParams.toString()}`;
    }

    return this._openGoogleHandler.getUrl({
      path,
      host: origins.viewer,
    });
  }

  async getCredentialsId({ user, googleAccessToken, ipAddress }: { user: User, googleAccessToken: string, ipAddress: string }): Promise<string> {
    const credentialsId = uuid();
    const { _id: userId, email } = user;
    const { token, refreshToken } = this.authService.getAuthToken({
      data: {
        _id: userId,
        email: user.email,
      },
      loginType: LOGIN_TYPE.GOOGLE,
    });
    await this.redisService.setRefreshToken(userId, refreshToken);
    const data: CredentialsFromOpenGooglePayload = {
      userId,
      email,
      googleAccessToken,
      token,
      refreshToken,
    };
    this.redisService.setCredentialsFromOpenGoogle(credentialsId, ipAddress, data);
    return credentialsId;
  }

  getWrongAccountUrl({
    host, email, anonymousUserId, query: { userId: _userId, ...state }, flowId,
  }: { host: string, email: string, flowId: string, anonymousUserId: string, query: IGoogleStateQuery }): string {
    const origins = this.getLuminOrigins(host);
    const url = this.createGoogleOauthUrl({
      anonymousUserId,
      state,
      origin: origins.backend,
      options: { prompt: 'select_account' },
      flowId,
    });
    return this._openGoogleHandler.getWrongAccountUrl({
      host, url, email,
    });
  }

  private getPostAuthUrl({
    state, flowId, authStatus, hasCurrentSession = false, host, referer,
  }:{
    state: IGoogleStateQuery,
    flowId:string,
    authStatus?: AuthenticationStatus,
    hasCurrentSession?: boolean,
    host: string,
    referer: string,
  }): string {
    const origins = this.getLuminOrigins(host);
    const postAuthUrl = this._openGoogleHandler.getUrl({
      path: '/open/google/post-auth',
      host: origins.backend,
    });
    let signature = '';
    signature = this.encryptData<TSignaturePayload>({
      state, authStatus: authStatus || AuthenticationStatus.AUTHENTICATED, flowId, referer,
    });
    const search = new URLSearchParams({ state: JSON.stringify({ signature }) });
    if (hasCurrentSession) {
      return `${postAuthUrl}?${search.toString()}`;
    }
    const authUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
    const gateWay = `${authUrl}/authentication/gateway?redirect_to=`;
    return `${gateWay}${postAuthUrl}?${search.toString()}`;
  }

  async getDriveFile(origin: string, { accessToken, fileId, options }: {
    accessToken: string,
    fileId: string,
    options?: Omit<DriveV3.Params$Resource$Files$Get, 'fileId'>
  }): Promise<{
    file: DriveV3.Schema$File,
    error?: Error;
  }> {
    const oauth2Client = this.createOAuth2Client(origin);
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
    const driveInstance = drive({
      version: 'v3',
      auth: oauth2Client as any,
    });
    try {
      const fileRes = await driveInstance.files.get({
        fileId,
        ...options,
      });
      return {
        file: fileRes.data,
      };
    } catch (e) {
      return {
        error: new Error(e.message as string),
        file: null,
      };
    }
  }

  private async handleAccessTokenValidation(
    payload : TValidateTokenHandler & { request: Request },
    // eslint-disable-next-line default-param-last
    options: { skipDriveInstall: boolean } = { skipDriveInstall: false },
    referer?: string,
  ): Promise<OpenGoogleReturn> {
    const {
      anonymousUserId, query, accessToken, headers, flowId, request,
    } = payload;
    const { state } = query;
    const fileId = state.ids[0];
    const { backend: backendUrl } = this.getLuminOrigins(headers.host);
    const oauth2Client = this.createOAuth2Client(backendUrl);
    const [tokenInfo, tokenError]: [TokenInfo, unknown] = await oauth2Client.getTokenInfo(accessToken)
      .then((info): [TokenInfo, unknown] => ([info, null]))
      .catch((_tokenError): [TokenInfo, unknown] => {
        this.eventTrackingService.trackError(
          request,
          { code: OpenGoogleErrorCode.INVALID_CREDENTIALS, message: _tokenError.message, stack: _tokenError?.stack },
        );
        return ([null, _tokenError]);
      });

    const responseObject: OpenGoogleReturn = {
      statusCode: HttpStatus.SEE_OTHER,
      nextUrl: '',
    };
    if (tokenError) {
      const nextUrl = this.createGoogleOauthUrl({
        origin: backendUrl, anonymousUserId, state, flowId, referer,
      });
      return {
        ...responseObject,
        nextUrl,
        cookies: {
          [this.openGoogleCookies.googleAccessTokenCookie]: {
            value: JSON.stringify(accessToken),
            options: { maxAge: 0 },
          },
        },
      };
    }

    const { scopes, email, expiry_date: expiryDate } = tokenInfo;

    const userRemoteId = tokenInfo.user_id || tokenInfo.sub;
    const hasDriveFile = scopes.includes(GoogleScope.DriveFile);
    const hasDriveInstall = scopes.includes(GoogleScope.DriveInstall);
    if (!hasDriveFile || (!hasDriveInstall && !options.skipDriveInstall)) {
      if (!hasDriveFile) {
        this.eventTrackingService.trackError(request, { message: 'Lack of drive.file scope', code: OpenGoogleErrorCode.INSUFFICIENT_PERMISSION });
      }
      if (!hasDriveInstall && !options.skipDriveInstall) {
        this.eventTrackingService.trackError(request, { message: 'Lack of drive.install scope', code: OpenGoogleErrorCode.INSUFFICIENT_PERMISSION });
      }
      const nextUrl = this.createGoogleOauthUrl({
        origin: backendUrl, anonymousUserId, state, options: { login_hint: email }, flowId, referer,
      });
      return {
        ...responseObject,
        nextUrl,
      };
    }
    const { error: driveError } = await this._openGoogleHandler.getRemoteFile({
      extra: {
        accessToken,
        fileId,
        options: {
          supportsAllDrives: true,
          fields: 'id,name',
        },
      },
      oauth2Client,
    });
    if (driveError) {
      this.eventTrackingService.trackError(request, { code: OpenGoogleErrorCode.WRONG_ACCOUNT, message: driveError.message });
      const nextUrl = this.getWrongAccountUrl({
        host: headers.host, anonymousUserId, email, query: state, flowId,
      });
      return {
        ...responseObject,
        nextUrl,
      };
    }
    // Set google access token to cookie
    const googleTokenCookie: TCookieValue = {
      value: JSON.stringify(<TGoogleTokenPayload>{
        accessToken, email, scope: scopes.join(' '), expireAt: expiryDate, userRemoteId,
      }),
      options: {
        // we need to calc maxAge based on expiryDate
        maxAge: 60 * 60 * 1000,
      },
    };
    const fromOpenGoogleFlow: TCookieValue = {
      value: 'true',
      options: {
        maxAge: 10 * 60 * 1000,
        sameSite: 'strict',
      },
    };
    responseObject.cookies = {
      [this.openGoogleCookies.googleAccessTokenCookie]: googleTokenCookie,
      [CommonOpenFlowCookie.InFlow]: fromOpenGoogleFlow,
    };
    let session = null;
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    if (!request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
      session = await this.authService.getAuthenticationToken(request.headers.cookie).catch((error) => {
        this.loggerService.error({
          error,
          context: 'openGoogleFlow:AccessTokenValidation',
        });
        return null;
      });
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
      session = await this.authService.verifyOryAuthenticationToken(request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]).catch(() => null);
    }
    const user = await this.userService.findUserByEmail(email);
    if (session && user) {
      if (session.identity.traits.email === email) {
        const postAuthUrl = this.getPostAuthUrl({
          state, flowId, hasCurrentSession: true, host: request.headers.host, referer,
        });
        if (session.identity.traits.loginService === LoginService.GOOGLE) {
          return {
            ...responseObject,
            nextUrl: postAuthUrl,
          };
        }
        // Email or Dropbox login service
        const kratosUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
        const destUrl = `${kratosUrl}/profile-settings?request_social_sign_in=${email}&provider=Google&return_to=${encodeURIComponent(postAuthUrl)}`;
        return {
          ...responseObject,
          nextUrl: destUrl,
        };
      }
      responseObject.cookies = { ...this.removeSessionCookie(), ...responseObject.cookies };
      await this.authService.revokeSession(session.id);
    }

    if (!user || user.loginService === LoginService.GOOGLE) {
      const kratosUrl = this.environmentService.getByKey(EnvConstants.KRATOS_PUBLIC_URL);
      let postAuthUrl = '';
      if (!user) {
        postAuthUrl = this.getPostAuthUrl({
          state: query.state, flowId, authStatus: AuthenticationStatus.SIGN_UP, host: request.headers.host, referer,
        });
        const signUpGoogleExpireIn = Number(CommonConstants.SIGN_UP_IN_GOOGLE_FLOW_EXPIRE_IN);
        this.redisService.setRedisDataWithExpireTime({
          key: `${RedisConstants.SIGN_UP_IN_GOOGLE_FLOW}${email}`, value: '1', expireTime: signUpGoogleExpireIn,
        });
      } else {
        postAuthUrl = this.getPostAuthUrl({
          state: query.state, flowId, authStatus: AuthenticationStatus.SIGN_IN, host: request.headers.host, referer,
        });
      }
      const destUrl = `${kratosUrl}/self-service/registration/browser?return_to=${encodeURIComponent(postAuthUrl)}`;
      return {
        ...responseObject,
        nextUrl: destUrl,
        cookies: {
          ...responseObject.cookies,
          [OpenGoogleCookie.GoogleLoginHint]: {
            value: email,
            options: merge({ maxAge: 10 * 60 * 1000 }), // 10 minutes
          },
          ...(!user && session) && this.removeSessionCookie(),
        },
      };
    }

    const { error, response: nextUrlForRestrictedUser } = await this._openGoogleHandler.getNextUrlForRestrictedUser(user, request);
    if (error) {
      this.eventTrackingService.trackError(
        request,
        { code: error.code, message: error.message },
        { email: user.email },
      );
    }
    if (nextUrlForRestrictedUser) {
      return nextUrlForRestrictedUser;
    }
    const anonymousViewerUrl = this._openGoogleHandler.getAnonymousViewerUrl({
      remoteId: fileId,
      hintLoginService: user.loginService,
      host: headers.host,
    });
    responseObject.nextUrl = anonymousViewerUrl;
    return responseObject;
  }

  setCookie(res: Response, cookies?: TCookiesResult): void {
    return this._openGoogleHandler.setCookie(res, cookies);
  }

  getTechnicalIssueUrl(host: string, anonymousUserId: string, flowId: string, state: IGoogleStateQuery): string {
    const origins = this.getLuminOrigins(host);
    const url = this.createGoogleOauthUrl({
      origin: origins.backend, anonymousUserId, state, flowId,
    });
    return this._openGoogleHandler.getTechnicalIssueUrl(host, url);
  }

  async initGoogleFlowHandler({
    anonymousUserId, query, accessTokenData, headers, flowId, request,
  }: TInitGoogleFlow & { request: Request }): Promise<OpenGoogleReturn> {
    const extendedCookie = {};
    const origins = this.getLuminOrigins(headers.host);
    if (!accessTokenData) {
      const nextUrl = this.createGoogleOauthUrl({
        origin: origins.backend, anonymousUserId, state: query.state, flowId, referer: request.headers.referer,
      });
      return {
        nextUrl,
        statusCode: HttpStatus.SEE_OTHER,
      };
    }
    const { accessToken, userRemoteId } = accessTokenData;
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    if (query.state.userId && userRemoteId !== query.state.userId) {
      let session = null;
      if (!request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
        session = await this.authService.getAuthenticationToken(request.headers.cookie).catch(() => null);
      }
      if (request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]) {
        session = await this.authService.verifyOryAuthenticationToken(request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]).catch(() => null);
      }
      if (session) {
        const revokeAuthenticationCookie: TCookieValue = {
          value: '',
          options: {
            maxAge: 0,
          },
        };
        extendedCookie[LUMIN_AUTHENTICATION_COOKIE_NAME] = revokeAuthenticationCookie;
        extendedCookie[orySessionName] = revokeAuthenticationCookie;
        await this.authService.revokeSession(session.id as string);
      }
      this.eventTrackingService.trackError(
        request,
        { code: OpenGoogleErrorCode.INVALID_CREDENTIALS, message: 'Has different between cache userId and googleUserId in url' },
      );
      const nextUrl = this.createGoogleOauthUrl({
        origin: origins.backend, anonymousUserId, state: query.state, flowId, referer: request.headers.referer,
      });
      return {
        nextUrl,
        statusCode: HttpStatus.SEE_OTHER,
        cookies: {
          [this.openGoogleCookies.googleAccessTokenCookie]: {
            value: JSON.stringify(accessToken),
            options: { maxAge: 0 },
          },
          ...extendedCookie,
        },
      };
    }
    return this.handleAccessTokenValidation({
      anonymousUserId,
      accessToken,
      headers,
      query,
      flowId,
      request,
    }, { skipDriveInstall: query.state.skipDriveInstall }, request.headers.referer);
  }

  async redirectOpenGoogleHandler({
    anonymousUserId, query, accessTokenData, headers, request,
  }: TRedirectGoogleFlow & { request: Request }): Promise<OpenGoogleReturn> {
    const { state: redirectState, code, error: consentError } = query;
    const { signature } = redirectState;
    const {
      state, loginHint, flowId, referer,
    } = this.decryptData<TSignaturePayload>(signature);
    const isUserDenied = consentError || !code;

    const origins = this.getLuminOrigins(headers.host);

    if (accessTokenData && isUserDenied) {
      const { scope, accessToken } = accessTokenData;
      // Handle denied drive.install
      if (scope.includes(GoogleScope.DriveFile)) {
        return this.handleAccessTokenValidation({
          anonymousUserId,
          query: { state },
          headers,
          accessToken,
          flowId,
          request,
        }, { skipDriveInstall: true }, referer);
      }
    }

    if (isUserDenied) {
      this.eventTrackingService.trackError(request, { code: OpenGoogleErrorCode.ACCESS_DENIED, message: consentError || 'No Google code' });
      const nextUrl = this.createGoogleOauthUrl({
        origin: origins.backend, anonymousUserId, state, options: { login_hint: loginHint }, flowId, referer,
      });
      return {
        nextUrl,
        statusCode: HttpStatus.SEE_OTHER,
      };
    }

    const oauth2Client = this.createOAuth2Client(origins.backend);

    const { tokens: { access_token: accessToken, scope } } = await oauth2Client.getToken(code);
    const tokenInfo: TokenInfo = await oauth2Client.getTokenInfo(accessToken);

    request.eventAttributes.commonAttributes.googleUserId = tokenInfo.user_id || tokenInfo.sub;
    this.eventTrackingService.trackGrantedScopes(request, scope);

    return this.handleAccessTokenValidation({
      anonymousUserId,
      query: { state },
      headers,
      accessToken,
      flowId,
      request,
    }, { skipDriveInstall: true }, referer);
  }

  async handlePostAuthentication({
    accessTokenData, anonymousUserId, state: queryState, headers, request,
  }: TPostAuthHandler & { request: Request }): Promise<OpenGoogleReturn> {
    const { signature } = queryState;
    const {
      state, flowId, authStatus, referer,
    } = this.decryptData<TSignaturePayload>(signature);
    const isAccessSignUpFlow = authStatus === AuthenticationStatus.SIGN_UP;
    const isAccessSignInFlow = authStatus === AuthenticationStatus.SIGN_IN;
    const fileId = state.ids[0];

    const origins = this.getLuminOrigins(headers.host);
    const oauth2Client = this.createOAuth2Client(origins.backend);
    const { accessToken, expireAt } = accessTokenData || {};
    if (!accessToken || (expireAt < Date.now())) {
      const nextUrl = this.createGoogleOauthUrl({
        origin: origins.backend, anonymousUserId, state, flowId, referer,
      });
      return {
        nextUrl,
        statusCode: HttpStatus.SEE_OTHER,
      };
    }
    let session = null;
    let cookies = null;
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    if (!request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] && request.cookies[orySessionName]) {
      session = await this.authService.getAuthenticationToken(request.headers.cookie).catch((error) => {
        this.loggerService.error({
          error,
          context: 'openGoogleFlow:handlePostAuthentication',
          extraInfo: {
            hasAccessToken: Boolean(accessToken),
          },
        });
        return null;
      });
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
    if (request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]) {
      session = await this.authService.verifyOryAuthenticationToken(request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]).catch((error) => {
        this.loggerService.error({
          error,
          context: 'openGoogleFlow:handlePostAuthentication2',
          extraInfo: {
            hasAccessToken: Boolean(accessToken),
          },
        });
        return null;
      });
    }
    const [
      { file, error: driveError },
      accessTokenInfo,
      user,
    ] = await Promise.all([
      this.getDriveFile(origins.backend, {
        accessToken,
        fileId,
        options: this.getDriveFileOptions(),
      }),
      oauth2Client.getTokenInfo(accessToken),
      this.userService.findUserByEmail(session.identity.traits.email),
    ]);
    let refererHostName = '';
    if (referer) {
      refererHostName = new URL(referer).hostname;
      this.userService.findOneAndUpdate({ _id: user._id }, { $addToSet: { 'metadata.openGoogleReferrer': refererHostName } });
    }
    request.eventAttributes.commonAttributes.googleUserId = accessTokenInfo.user_id || accessTokenInfo.sub;
    const existSignUpEvent = await this.redisService.getValueAndDeleteKey(`${RedisConstants.SIGN_UP_IN_GOOGLE_FLOW}${user.email}`);
    if (isAccessSignUpFlow && existSignUpEvent) {
      this._openGoogleHandler.emitReloadMessage(anonymousUserId);
      this.eventTrackingService.trackNewUserEvent(request, user);
    }
    // Handle in case user access to old url from history browser
    if (isAccessSignInFlow || (isAccessSignUpFlow && !existSignUpEvent)) {
      this._openGoogleHandler.emitReloadMessage(anonymousUserId);
      this.eventTrackingService.trackUserSignIn(request);
    }
    if (driveError) {
      this.eventTrackingService.trackError(request, { code: OpenGoogleErrorCode.WRONG_ACCOUNT, message: driveError.message });
      const nextUrl = this.getWrongAccountUrl({
        host: headers.host, anonymousUserId, email: user.email, query: state, flowId,
      });
      return {
        nextUrl,
        statusCode: HttpStatus.SEE_OTHER,
      };
    }
    const { response: nextUrlForIpValidation } = this._openGoogleHandler.getNextUrlForIpValidation(user, request);
    if (nextUrlForIpValidation) {
      return { ...nextUrlForIpValidation, cookies };
    }

    const userRules = new UserRules(this.customRulesService, this.customRuleLoader, user);
    if (userRules.requireOrgMembershipOnSignIn) {
      const { response: nextUrlForOrgMembershipValidation } = await this._openGoogleHandler.getNextUrlForOrgMembershipValidation(user, headers.host);
      if (nextUrlForOrgMembershipValidation) {
        return { ...nextUrlForOrgMembershipValidation, cookies };
      }
    }
    if (isAccessSignUpFlow && userRules.autoJoinOrgAfterSignUp) {
      await this.customRulesService.addSignUpUserToOrg({
        orgId: userRules.orgId,
        signUpUser: user,
      });
    }

    const { document, error } = await this._openGoogleHandler.createDriveDocument({
      user,
      file,
      remoteEmail: accessTokenInfo.email,
      mimeType: file.mimeType,
      documentService: ThirdPartyService.google,
      accessToken,
    });
    if (error) {
      if (error instanceof NotAcceptException && error.extensions.code === ErrorCode.Common.INVALID_INPUT) {
        throw OpenGoogleErrorException.InvalidMimeType(error.message, {
          mimetype: file.mimeType,
          nextUrl: error.getMetadata().url,
        });
      } else {
        throw error;
      }
    }
    const ipAddress = Utils.getIpRequest({ headers });
    const credentialsId = await this.getCredentialsId({ user, googleAccessToken: accessToken, ipAddress });
    const additionalParams = new URLSearchParams();
    const shouldSuggestOrg = await this.shouldSuggestOrgAfterFlow(user);
    additionalParams.set(UrlSearchParam.CAN_JOIN_WORKSPACE, String(shouldSuggestOrg));
    if (referer) {
      additionalParams.set(UrlSearchParam.FROM, this.extractReferer(refererHostName));
    }
    return {
      nextUrl: this.getViewerUrl(headers.host, document._id, credentialsId, {
        action: state.lm_action,
        from: state.lm_from,
        authStatus,
      }, additionalParams),
      statusCode: HttpStatus.SEE_OTHER,
      cookies,
    };
  }

  getBrowserPreferedLanguage(request: Request): string {
    return this._openGoogleHandler.getBrowserPreferedLanguage(request);
  }

  getLuminOrigins(host: string): { backend: string, viewer: string } {
    if (this.environmentService.isDevelopment) {
      return {
        backend: this.environmentService.getByKey(EnvConstants.APP_BACKEND_URL),
        viewer: this.environmentService.getByKey(EnvConstants.BASE_URL),
      };
    }
    const { origin } = new URL('/', `https://${host}`);
    const url = origin === TESTING_URL ? TESTING_URL : this.environmentService.getByKey(EnvConstants.BASE_URL);
    return {
      backend: url,
      viewer: url,
    };
  }

  getWrongMimeTypeUrl(host: string, metaData: { nextUrl: string }): string {
    const { nextUrl } = metaData;
    const origins = this.getLuminOrigins(host);
    return this._openGoogleHandler.getUrl({
      path: nextUrl || '/documents/personal',
      host: origins.viewer,
      query: {
        open_google_state: 'wrong_mime_type',
      },
    });
  }

  getWrongIpUrl(host: string, email: string): string {
    const origins = this.getLuminOrigins(host);
    return this._openGoogleHandler.getUrl({
      path: '/technical-issue',
      host: origins.viewer,
      query: {
        wrong_email: email,
      },
    });
  }

  getRequireOrgMembershipUrl(host: string, email: string): string {
    const origins = this.getLuminOrigins(host);
    return this._openGoogleHandler.getUrl({
      path: '/technical-issue',
      host: origins.viewer,
      query: {
        require_org_membership: true,
        email,
      },
    });
  }

  loadGoogleCookieNames(): {
    googleAccessTokenCookie: string,
    } {
    const isDevelopmentOrProduction = this.environmentService.isProduction || this.environmentService.isDevelopment;
    if (isDevelopmentOrProduction) {
      return {
        googleAccessTokenCookie: OpenGoogleCookie.GoogleAccessToken,
      };
    }
    return {
      googleAccessTokenCookie: `${OpenGoogleCookie.GoogleAccessToken}_${this.environmentService.getByKey(EnvConstants.ENV)}`,
    };
  }

  removeSessionCookie(): { [key: string]: TCookieValue } {
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

  async shouldSuggestOrgAfterFlow(user: User): Promise<boolean> {
    const targetDomain = Utils.getEmailDomain(user.email);
    if (popularDomains[targetDomain]) {
      return false;
    }
    const { highestOrgPlan, hasShowOnboardingFlowFromOpenGoogle } = user.metadata;
    if (highestOrgPlan && highestOrgPlan.highestLuminPlan !== PaymentPlanEnums.FREE) {
      return false;
    }
    const { orgList, error } = await this.organizationService.getSuggestedOrgListByUserDomain({ userEmail: user.email, userId: user._id });
    if (error) {
      this.loggerService.error({
        context: this.shouldSuggestOrgAfterFlow.name,
        error,
      });
      return false;
    }
    this.userService.updateUserPropertyById(user._id, { 'metadata.hasShowOnboardingFlowFromOpenGoogle': true });
    return Boolean(orgList.length) && !hasShowOnboardingFlowFromOpenGoogle;
  }

  extractReferer(referer: string): string {
    switch (referer) {
      case 'mail.google.com':
        return 'mail';
      case 'drive.google.com':
        return 'drive';
      case 'classroom.google.com':
        return 'classroom';
      default:
        return 'g-other';
    }
  }
}
