/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import { RecaptchaEnterpriseServiceClient, protos as RecaptchaProtos } from '@google-cloud/recaptcha-enterprise';
import { Metadata } from '@grpc/grpc-js';
import { HttpService } from '@nestjs/axios';
import {
  Inject,
  forwardRef,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IdentityCredentials, JsonPatch, Session } from '@ory/client';
import appleSignin, { AppleIdTokenType } from 'apple-signin-auth';
import { AxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  isEmpty, merge, isNil, get,
} from 'lodash';
import { MongoServerError } from 'mongodb';
import fetch from 'node-fetch';
import { stringify } from 'query-string';
import { map } from 'rxjs/operators';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_TYPE } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { GrpcAvailableServices } from 'Common/constants/GrpcConstants';
import {
  NotiOrg,
} from 'Common/constants/NotificationConstants';
import { PLAN_URL } from 'Common/constants/PaymentConstant';
import { SOCKET_MESSAGE, SOCKET_NAMESPACE } from 'Common/constants/SocketConstants';
import { UrlSearchParam } from 'Common/constants/UrlSearchParam';
import { LOGIN_TYPE, RECAPTCHA_V3_USER_BLACKLIST, UNKNOWN_THIRD_PARTY } from 'Common/constants/UserConstants';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { ApplicationError, ServerErrorException } from 'Common/errors/ServerErrorException';
import { Utils } from 'Common/utils/Utils';

import { AdminStatus } from 'Admin/admin.enum';
import { AdminService } from 'Admin/admin.service';
import { IAdmin } from 'Admin/interfaces/admin.interface';
import { APP_USER_TYPE, TOKEN_TYPE } from 'Auth/auth.enum';
import { extractHydraError } from 'Auth/auth.util';
import { HandleKratosRegistrationCallbackDto } from 'Auth/dto/auth.dto';
import {
  ILoginWithGoogleInput,
  ILoginWithGoogleV2Input,
  IUserInvitationToken,
  ISignUpWithDropBoxInput,
  ISignUpWithThirdPartyInput,
  UserInvitationTokenType,
  InvitationTokenStatus,
  IVerifyUserInvitationResult,
} from 'Auth/interfaces/auth.interface';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { USER_VERSION } from 'constant';
import { DocumentService } from 'Document/document.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import {
  AuthenType,
  ForgotPasswordInput, SignInPayload, SignInThirdPartyPayload, SignUpInput,
  RedirectData,
  AdminSignInPayload,
  ResetPasswordInput,
  AdminCreatePasswordInput,
  LoginService,
  ForgotPasswordPayload,
  PaymentPeriod,
  PaymentPlanSubscription,
  OpenTemplateData,
  CredentialsFromOpenGooglePayload,
} from 'graphql.schema';
import { KratosService } from 'Kratos/kratos.service';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { IRequestAccess } from 'Organization/interfaces/request.access.interface';
import { AccessTypeOrganization } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserOrigin } from 'User/user.enum';
import { UserService } from 'User/user.service';

import { IGqlRequest } from './interfaces/IGqlRequest';
import { OryJwtService } from './ory.jwt.service';
import { WhitelistIPService } from './whitelistIP.sevice';

@Injectable()
export class AuthService {
  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  googleClient = new OAuth2Client(this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID));

  minimumExperimentalUserId = this.environmentService.getByKey(EnvConstants.MINIMUM_EXPERIMENTAL_USER_ID_FOR_DATA_COLLECTION);

  private readonly recaptchaEnterpriseClient: RecaptchaEnterpriseServiceClient | null = null;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly eventService: EventServiceFactory,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly blacklistService: BlacklistService,
    @Inject(forwardRef(() => DocumentService)) private readonly documentService: DocumentService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => OrganizationTeamService))
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly kratosService: KratosService,
    private readonly whitelistIPService: WhitelistIPService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly messageGateway: EventsGateway,
    private readonly oryJwtService: OryJwtService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    const gcloudRecaptchaApiKey = this.environmentService.getByKey(EnvConstants.GCLOUD_RECAPTCHA_API_KEY);
    if (gcloudRecaptchaApiKey) {
      this.recaptchaEnterpriseClient = new RecaptchaEnterpriseServiceClient({
        apiKey: gcloudRecaptchaApiKey,
      });
    }
  }

  // kratos
  public async signUp(signUpUser: SignUpInput): Promise<{ user?: User, tokenVerifyAccount?: string, error?: ApplicationError }> {
    const {
      redirectData, email, sharingToken, browserLanguageCode, origin, openTemplateData,
    } = signUpUser;
    const user = await this.userService.findUserByEmail(email, { _id: 1 });
    if (user) {
      return {
        error: ServerErrorException.AlreadyExist('This email already exists', ErrorCode.User.EMAIL_ALREADY_EXISTS),
      };
    }
    signUpUser.loginService = LoginService.EMAIL_PASSWORD;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const signUpData = Object.assign(Object.create(Object.getPrototypeOf(signUpUser)), signUpUser);
    signUpData.version = USER_VERSION;
    if (sharingToken) {
      signUpData.isVerified = true;
    }
    const createdUser = await this.userService.createUser(signUpData);
    if (!createdUser) {
      return {
        error: ServerErrorException.Internal('auth.service -> signUp -> fail to create user', ErrorCode.User.CREATE_USER_FAIL),
      };
    }
    const userId = createdUser._id;
    const userOrigin = (origin || UserOrigin.LUMIN) as UserOrigin;
    if (userOrigin === UserOrigin.LUMIN) {
      this.userService.updateUserDataAfterSignUp({
        userId,
        userName: createdUser.name,
        email: createdUser.email,
        authenType: redirectData?.authType || AuthenType.NORMAL,
        browserLanguageCode,
        createdAt: createdUser.createdAt,
        loginService: createdUser.loginService,
      });
    } else {
      try {
        await this.userService.updateUserDataAfterSignUp({
          userId,
          userName: createdUser.name,
          email: createdUser.email,
          authenType: redirectData?.authType || AuthenType.NORMAL,
          browserLanguageCode,
          createdAt: createdUser.createdAt,
          loginService: createdUser.loginService,
        });
      } catch (error) {
        this.loggerService.error({
          context: 'updateUserDataAfterSignUp',
          error,
          extraInfo: {
            userId,
          },
        });
      }
    }

    if (!sharingToken && createdUser.origin !== UserOrigin.BANANASIGN) {
      const emailData = {
        verifyLink: this.getVerifyAccountToken({ createdUser, redirectData, openTemplateData }),
      };
      this.emailService.sendEmail(EMAIL_TYPE.CONFIRM_EMAIL, [createdUser.email], emailData, createdUser.origin);
    }
    if (signUpData.landingPageToken && createdUser) {
      this.redisService.setRedisData(`ltk:${createdUser._id}`, signUpData.landingPageToken as string);
      this.redisService.setExpireKey(`ltk:${createdUser._id}`, CommonConstants.EXPIRE_LANDING_PAGE_TOKEN);
    }
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
      actor: createdUser,
    });

    if (createdUser.origin === UserOrigin.BANANASIGN) {
      const tokenPayload = {
        _id: createdUser._id,
        email: createdUser.email,
        name: createdUser.name,
        type: TOKEN_TYPE.VERIFY_ACCOUNT,
      };
      const tokenVerifyAccount = this.createToken(tokenPayload, this.environmentService.getByKey(EnvConstants.JWT_EXPIRE_VERIFY_ACCOUNT_IN));
      this.redisService.setValidVerifyToken(createdUser.email, tokenVerifyAccount);

      return {
        user: createdUser,
        tokenVerifyAccount,
      };
    }

    // Set form remote id to redis to handle open form when user access Lumin app after verifying email successfully
    if (openTemplateData) {
      const { templateId, source } = openTemplateData;
      this.redisService.setOpenFormFromTemplates({ userId: createdUser._id, formRemoteId: templateId, source });
    }

    return {
      user: createdUser,
    };
  }

  private getVerifyAccountToken(input: {
    createdUser: Partial<User>,
    redirectData: RedirectData,
    openTemplateData?: OpenTemplateData,
  }): string {
    const { createdUser, redirectData, openTemplateData } = input;
    const tokenPayload = {
      _id: createdUser._id,
      email: createdUser.email,
      name: createdUser.name,
      type: TOKEN_TYPE.VERIFY_ACCOUNT,
    };
    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    const tokenVerifyAccount = this.createToken(tokenPayload, this.environmentService.getByKey(EnvConstants.JWT_EXPIRE_VERIFY_ACCOUNT_IN));
    this.redisService.setValidVerifyToken(createdUser.email, tokenVerifyAccount);
    if (openTemplateData) {
      return `${baseUrl}/verify-account?token=${tokenVerifyAccount}${this.getOpenTemplateContinueUrl(openTemplateData)}`;
    }
    return `${baseUrl}/verify-account?token=${tokenVerifyAccount}${this.getContinueUrlAfterVerifying(redirectData)}`;
  }

  private getOpenTemplateContinueUrl(openTemplateData: OpenTemplateData): string {
    const { source } = openTemplateData;
    const sourceParam = source ? `&source=${source}` : '';
    const continueUrl = encodeURIComponent(`/authentication/signin?from=templates${sourceParam}`);
    return `&${UrlSearchParam.CONTINUE_URL}=${continueUrl}`;
  }

  private getContinueUrlAfterVerifying(redirectData: RedirectData): string {
    if (redirectData) {
      const {
        plan, period, promotionCode, isTrial,
      } = redirectData;
      const urlParams = this.getUrlParams({
        plan, promotionCode, period, isTrial,
      });
      const url = encodeURIComponent(`/authentication/${urlParams}`);
      return `&${UrlSearchParam.CONTINUE_URL}=${url}`;
    }
    return '';
  }

  getUrlParams({
    plan,
    promotionCode,
    period,
    isTrial,
  }: {
    plan: PaymentPlanSubscription,
    promotionCode: string,
    period: PaymentPeriod,
    isTrial: boolean
  }): string {
    const signinType = isTrial ? 'trial-signin' : 'signin';
    const planType = PLAN_URL[plan];
    const search = new URLSearchParams({
      ...planType && { [UrlSearchParam.PLAN]: planType },
      ...period && { [UrlSearchParam.PERIOD]: period.toLowerCase() },
      ...promotionCode && { [UrlSearchParam.PROMOTION]: promotionCode },
    });
    return [signinType, search.toString()].filter(Boolean).join('?');
  }

  public async signUpWithInvite(params: {
    signUpUser: SignUpInput, shouldCreateDefaultOrg: boolean,
  }): Promise<{ user?: User, error?: ApplicationError }> {
    const { signUpUser, shouldCreateDefaultOrg } = params;
    const user = await this.userService.findUserByEmail(signUpUser.email, { _id: 1 });
    if (user) {
      return {
        error: ServerErrorException.AlreadyExist('This email already exists', ErrorCode.User.EMAIL_ALREADY_EXISTS),
      };
    }
    const createdUser = await this.userService.createUser({
      ...signUpUser,
      loginService: LoginService.EMAIL_PASSWORD,
      isVerified: true,
    });
    if (!createdUser) {
      return {
        error: ServerErrorException.Internal('auth.service -> signUpWithInvite -> createUser', ErrorCode.User.CREATE_USER_FAIL),
      };
    }

    this.eventService.createEvent({
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
      actor: createdUser,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const organization = await this.organizationService.findOneOrganization({ ownerId: createdUser._id });
    if (!organization && createdUser.payment.type === PaymentPlanEnums.FREE && shouldCreateDefaultOrg) {
      await this.organizationService.createCustomOrganization(createdUser);
    }
    return { user: createdUser };
  }

  public destructSignUpInput(signUpUser: SignUpInput): { signUpData?: SignUpInput, error?: ApplicationError } {
    const { email, password } = signUpUser;
    const validateEmail = email && Utils.validateEmail(email);
    if (!validateEmail || !email) {
      return {
        error: ServerErrorException.BadRequest('Invalid Email', ErrorCode.User.INVALID_EMAIL),
      };
    }
    const validatePassword = password && Utils.validatePassword(password);
    if (!validatePassword || !password) {
      return {
        error: ServerErrorException.BadRequest(
          'Password should be greater than 8 characters and less than 32 characters',
          ErrorCode.User.USER_REQUIRE_STRONG_PASSWORD,
        ),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const signUpData = Object.assign(Object.create(Object.getPrototypeOf(signUpUser)), signUpUser);
    signUpData.email = signUpData.email.toLowerCase();
    return { signUpData };
  }

  private async throwErrorOnFailedAttempt(email: string, attempts: number) {
    await this.redisService.setUserFailedAttempt(email);
    return {
      error: ServerErrorException.BadRequest(
        `Incorrect email or password. You have ${CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS - (Number(attempts))} login attempts left`,
        ErrorCode.User.SIGN_IN_FAIL_ATTEMPT_REMAINING,
        { remainingAttempts: CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS - (Number(attempts)) },
      ),
    };
  }

  private async throwErrorOnFailedAdminAttempt(email: string, attempts: number) {
    await this.redisService.setUserFailedAttempt(email, true);
    throw GraphErrorException.BadRequest(
      'Signin fail',
      ErrorCode.User.SIGN_IN_FAIL_ATTEMPT_REMAINING,
      { remainingAttempts: CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS - (Number(attempts)) },
    );
  }

  private async throwErrorOnBlockedAdminAccount(email: string) {
    const ttl = await this.redisService.getKeyTTL(`${RedisConstants.ADMIN_SIGN_IN_ATTEMPT_PREFIX}${email}`);
    throw GraphErrorException.Unauthorized(
      `Your account has been temporarily blocked for ${Math.ceil(ttl / 60)} minute(s)`,
      ErrorCode.User.ACCOUNT_BLOCKED,
      { blockTime: Math.ceil(ttl / 60) },
    );
  }

  private async handleInvalidSignInData(email: string, prevFailedAttempts: number): Promise<void> {
    // Throw blocked error for the last failed attempt
    if (prevFailedAttempts === CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS - 1) {
      await this.throwErrorOnBlockedAdminAccount(email);
    }
    await this.throwErrorOnFailedAdminAttempt(email, prevFailedAttempts + 1);
  }

  private updateUserAfterSignIn(user: User, timezoneOffset: number) {
    this.userService.undoDeleteUser(user._id);
    this.userService.updateUserPropertyById(user._id, {
      timezoneOffset,
      lastLogin: new Date(),
      lastAccess: new Date(),
    });
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
      eventScope: EventScopes.PERSONAL,
      actor: user,
    });
  }

  async verifyGoogleToken(idToken, platform = '') {
    let ticket;
    if (platform.toUpperCase() === 'IOS') {
      const googleClientId = this.environmentService.getByKey(EnvConstants.GOOGLE_IOS_CLIENT_ID);
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
    } else if (platform.toUpperCase() === 'ANDROID') {
      const googleClientId = this.environmentService.getByKey(EnvConstants.GOOGLE_ANDROID_CLIENT_ID);
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
    } else {
      const googleClientId = this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID);
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
    }
    const payload = ticket.getPayload();
    return payload;
  }

  private async verifyGoogleTokenFromGrpcClient(
    idToken: string,
    platform: string,
    clientIdentifier: string,
  ) {
    let googleClientId;
    if (!platform) {
      throw GrpcErrorException.ApplicationError(ServerErrorException.Internal('Platform missing', ErrorCode.GrpcService.PLATFORM_MISSING));
    }
    if (clientIdentifier !== GrpcAvailableServices.LUMIN_CONTRACT) {
      throw GrpcErrorException.ApplicationError(ServerErrorException.Internal('Unhandled client identifier', ErrorCode.GrpcService.INVALID_CLIENT));
    }
    if (platform.toUpperCase() === 'IOS') {
      googleClientId = this.environmentService.getByKey(
        EnvConstants.CONTRACT_GOOGLE_IOS_CLIENT_ID,
      );
    }
    if (platform.toUpperCase() === 'ANDROID') {
      googleClientId = this.environmentService.getByKey(
        EnvConstants.CONTRACT_GOOGLE_ANDROID_CLIENT_ID,
      );
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    return ticket.getPayload();
  }

  /**
   * @deprecated
 */
  public async signIn(params: {
    userEmail: string,
    password: string,
    timezoneOffset: number,
    browserLanguageCode?: string,
    ipAddress?: string,
  }): Promise<{ data?: SignInPayload, error?: ApplicationError }> {
    const {
      userEmail, password, timezoneOffset, browserLanguageCode, ipAddress,
    } = params;
    const email = userEmail?.toLowerCase();
    const prevFailedAttempts = await this.redisService.getUserFailedAttempt(email);
    let errorResponse: { error: ApplicationError };
    if (prevFailedAttempts >= CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS) {
      errorResponse = await this.throwErrorOnBlockedAccount(email);
      return errorResponse;
    }
    // Validate user not found
    const user = await this.userService.findUserByEmail(email, null);
    if (!user) {
      errorResponse = await this.throwErrorOnInvalidSignInData(email, prevFailedAttempts);
      return errorResponse;
    }
    if (!user.isVerified) {
      return {
        error: ServerErrorException.Unauthorized(
          'This account is not verified yet. Please check your email and try again',
          ErrorCode.User.USER_NOT_VERIFIED,
        ),
      };
    }
    if (user.password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        errorResponse = await this.throwErrorOnInvalidSignInData(email, prevFailedAttempts);
        return errorResponse;
      }
    } else {
      return {
        error: ServerErrorException.BadRequest(
          // eslint-disable-next-line max-len
          'This email address is currently being used with Google, Dropbox or Microsoft. Please sign in with Google Drive, Dropbox or Microsoft',
          ErrorCode.User.THIRD_PARTY_ACCOUNT,
        ),
      };
    }
    const orgInvitedId = await this.redisService.checkUserSignUpWithInvite(
      email,
    );
    if (orgInvitedId) {
      const orgIds = await this.organizationService.addUserToOrgsWithInvitation(user, orgInvitedId);
      await this.documentService.createNonLuminUserDocumentPermission({
        user,
        orgIds,
        teamIds: [],
      });
    } else {
      await this.documentService.createNonLuminUserDocumentPermission({
        user,
        orgIds: [],
        teamIds: [],
      });
    }

    // We can check user is first login by timezoneOffset because it has value when user login.
    // eslint-disable-next-line no-restricted-globals
    const isFirstLogin = isNaN(user.timezoneOffset);
    if (isFirstLogin) {
      const requestAccesses = await this.organizationService.getInviteOrgList({ actor: email, type: AccessTypeOrganization.INVITE_ORGANIZATION });
      if (!isEmpty(requestAccesses)) {
        await this.sendNotificationFirstLoginUser(requestAccesses);
      }
    }

    // update user loginService
    const updateData: any = {
      ...(!user.loginService && { loginService: LoginService.EMAIL_PASSWORD }),
      ...(isFirstLogin && { version: USER_VERSION }),
    };
    const updatedUser = await this.userService.updateUserPropertyById(user._id, updateData, false, { lean: false });

    await this.userService.migratePersonalWorkspace(updatedUser);
    const respUser = await this.userService.interceptUserData({ user: updatedUser, loginService: LoginService.EMAIL_PASSWORD });
    const { token, refreshToken, error: authTokenError } = this.getAuthToken({ isGraphqlRequest: true, ipAddress, data: respUser });
    if (authTokenError) {
      throw authTokenError;
    }
    this.redisService.setRefreshToken(respUser._id, refreshToken);
    this.updateUserAfterSignIn(user, timezoneOffset);
    this.userService.updateBrowserLanguageToHubspot({ email, languageCode: browserLanguageCode, lastLogin: user.lastLogin });

    const openFormUrl = await this.redisService.getOpenFormFromTemplates(user._id);
    if (openFormUrl) {
      respUser.redirectUrl = openFormUrl;
    }
    return {
      data: {
        token,
        refreshToken,
        user: respUser,
        origin: user.origin,
      },
    };
  }

  private async throwErrorOnBlockedAccount(email: string): Promise<{ error: ApplicationError }> {
    const ttl = await this.redisService.getKeyTTL(`attempt-${email}`);
    return {
      error: ServerErrorException.Unauthorized(
        `Your account has been temporarily blocked for ${Math.ceil(ttl / 60)} minutes`,
        ErrorCode.User.ACCOUNT_BLOCKED,
        { blockTime: Math.ceil(ttl / 60) },
      ),
    };
  }

  private async throwErrorOnInvalidSignInData(email: string, prevFailedAttempts: number): Promise<{error: ApplicationError}> {
    let errorResponse: { error: ApplicationError };
    // Throw blocked error for the last failed attempt
    if (prevFailedAttempts === CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS - 1) {
      await this.redisService.setUserFailedAttempt(email);
      errorResponse = await this.throwErrorOnBlockedAccount(email);
    } else {
      errorResponse = await this.throwErrorOnFailedAttempt(email, prevFailedAttempts + 1);
    }
    return errorResponse;
  }

  /**
   * @deprecated
 */
  private async signInWithGoogle(
    userData: User,
    timezoneOffset: number,
    eventData: ICreateEventInput,
    browserLanguageCode?: string,
    ipAddress?: string,
    context?: AuthenType,
  ) {
    const tokenData: {
      _id: string,
      email: string,
    } = {
      _id: userData._id,
      email: userData.email,
    };
    const { token, refreshToken, error: authTokenError } = this.getAuthToken({
      data: tokenData, loginType: LOGIN_TYPE.GOOGLE, isGraphqlRequest: true, ipAddress,
    });
    if (authTokenError) {
      throw authTokenError;
    }
    this.redisService.setRefreshToken(tokenData._id, refreshToken);
    if (!isNil(userData.password)) {
      await this.userService.findOneAndUpdate({ _id: userData._id }, { $unset: { password: 1 } });
    }
    const updatedUser = await this.userService.updateUserPropertyById(
      userData._id,
      {
        isVerified: true,
        lastLogin: new Date(),
        timezoneOffset,
        lastAccess: new Date(),
        loginService: this.userService.getLoginService({ userLoginService: userData.loginService, defaultLoginService: LoginService.GOOGLE }),
        ...(!userData.name && { name: this.userService.getValidUserName(userData.email, userData.name) }),
      },
      true,
      { lean: false },
    );

    await this.userService.migratePersonalWorkspace(updatedUser);
    const respData = await this.userService.interceptUserData({ user: updatedUser, loginService: LoginService.GOOGLE });
    this.userService.updateBrowserLanguageToHubspot({ email: userData.email, languageCode: browserLanguageCode, lastLogin: userData.lastLogin });

    if (context === AuthenType.TEMPLATES_OPEN) {
      await this.organizationService.createDefaultOrganizationForOpeningTemplates(updatedUser);
    }

    this.eventService.createEvent({
      ...eventData,
      actor: userData,
    });
    return {
      token,
      refreshToken,
      user: respData,
      isSignedUp: true,
    };
  }

  async handleKratosRegistrationFlowCallback(req: HandleKratosRegistrationCallbackDto): Promise<void> {
    const {
      email, loginType, identityId, name,
    } = req;
    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, req.email);
    if (existedBlacklist) {
      throw GraphErrorException.NotAcceptable('This email is banned', ErrorCode.User.EMAIL_IS_BANNED);
    }

    const linkedWithExistingEmail = await this.linkExistingEmailWithKratosIdentity({
      email, identityId, loginService: loginType, name,
    });
    if (!linkedWithExistingEmail) {
      await this.newUserFromKratos(req);
    }
  }

  public async newUserFromKratos(req: HandleKratosRegistrationCallbackDto): Promise<void> {
    const newUserData = {
      identityId: req.identityId,
      email: req.email,
      name: req.name,
      // TODO: check logic, use Kratos verify field
      isVerified: req.isVerified || false,
      loginService: req.loginType,
      ...(req.appleUserId && { appleUserId: req.appleUserId }),
      origin: req.userOrigin || UserOrigin.LUMIN,
      version: USER_VERSION,
    };

    // Handle race condition when creating new user
    let newUser;
    try {
      newUser = await this.userService.createUser(newUserData);
    } catch (err) {
      // 11000: Duplicated key
      if (err instanceof MongoServerError && err.code === 11000) {
        return;
      }
      throw err;
    }

    const respData = await this.userService.interceptUserData({ user: newUser, loginService: req.loginType });

    if (respData.loginService !== LoginService.EMAIL_PASSWORD) {
      this.emailService.sendEmail(
        EMAIL_TYPE.WELCOME,
        [respData.email],
        {
          name: respData.name,
          mobileDeeplinkUrl: this.emailService.generateDeeplinkForEmail('/email-welcome'),
        },
        newUser.origin as string,
      );
    }
    // TODO: migrate this flow
    // if (signUpData.landingPageToken && createdUser) {
    //   this.redisService.setRedisData(`ltk:${createdUser._id}`, signUpData.landingPageToken);
    //   this.redisService.setExpireKey(`ltk:${createdUser._id}`, CommonConstants.EXPIRE_LANDING_PAGE_TOKEN);
    // }

    this.eventService.createEvent({
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
      actor: newUser,
    });

    this.userService
      .updateUserDataAfterSignUp({
        userId: newUser._id,
        email: respData.email,
        userName: respData.name,
        authenType: AuthenType.NORMAL,
        createdAt: respData.createdAt,
        loginService: respData.loginService,
        platform: req.platform,
        userAgent: req.userAgent,
        anonymousUserId: req.anonymousUserId,
      })
      .catch((err) => {
        this.loggerService.error({
          stack: err.stack,
          context: 'newUserFromKratos: updateUserDataAfterSignUp',
        });
      });
    try {
      this.rabbitMQService.publish(EXCHANGE_KEYS.USER_REGISTRATION, ROUTING_KEY.USER_REGISTRATION_SUCCESS, {
        userId: newUser._id,
        email: newUser.email,
        name: newUser.name,
        identityId: newUser.identityId,
      });
    } catch (error) {
      this.loggerService.error({
        context: 'publish user to rabbitmq',
        error,
      });
    }
  }

  private async tryLinkExistingEmailWithKratosIdentity(email: string, id: string) {
    const userExists = await this.userService.existsUserEmail(email);
    if (userExists) {
      await this.userService.linkEmailWithKratosIdentity(email, id);
      return true;
    }
    return false;
  }

  private async signUpWithThirdParty({
    email,
    name,
    timezoneOffset,
    eventData,
    context,
    loginType,
    userOrigin,
    invitationToken,
    browserLanguageCode,
    ipAddress,
  }: ISignUpWithThirdPartyInput & { browserLanguageCode?: string; ipAddress?: string }) {
    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
    if (existedBlacklist) {
      throw GraphErrorException.NotAcceptable('This email is banned', ErrorCode.User.EMAIL_IS_BANNED);
    }
    const loginService = loginType === LOGIN_TYPE.GOOGLE ? LoginService.GOOGLE : LoginService.DROPBOX;
    const origin = (userOrigin || UserOrigin.LUMIN) as UserOrigin;
    const newUserData = {
      email,
      name: this.userService.getValidUserName(email, name),
      isVerified: true,
      timezoneOffset,
      loginService,
      origin,
      version: USER_VERSION,
    };
    const newUser = await this.userService.createUser(newUserData);
    const userId = newUser._id;
    const tokenData: {
      _id: string,
      email: string,
    } = {
      _id: userId,
      email,
    };
    const { token, refreshToken, error: authTokenError } = this.getAuthToken({
      data: tokenData, loginType, isGraphqlRequest: true, ipAddress,
    });
    if (authTokenError) {
      throw authTokenError;
    }
    let orgIds = [];
    this.redisService.setRefreshToken(tokenData._id, refreshToken);

    await this.userService.migratePersonalWorkspace(newUser);
    const respData = await this.userService.interceptUserData({ user: newUser, loginService });

    if (context === AuthenType.TEMPLATES_OPEN) {
      await this.organizationService.createDefaultOrganizationForOpeningTemplates(newUser);
    }

    if (invitationToken) {
      const { email: invitedEmail, orgId: orgInvitedId }: {
        email: string,
        orgId: string,
      } = this.jwtService.verify(invitationToken);
      const invitation = await this.organizationService.getRequestAccessByOrgIdAndEmail(orgInvitedId, invitedEmail);
      if (invitation && invitedEmail === email) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const organization = await this.organizationService.findOneOrganization({ ownerId: userId });
        if (!organization && newUser.payment.type === PaymentPlanEnums.FREE) {
          await this.organizationService.createCustomOrganization(newUser);
        }
        orgIds = await this.organizationService.addUserToOrgsWithInvitation(newUser, orgInvitedId);
      }
    }
    await this.documentService.createNonLuminUserDocumentPermission({
      user: newUser,
      orgIds,
      teamIds: [],
    });
    await this.userService.createOrgInvitationNotiAfterLogin(email);
    this.emailService.sendEmail(
      EMAIL_TYPE.WELCOME,
      [respData.email],
      {
        name: respData.name,
        mobileDeeplinkUrl: this.emailService.generateDeeplinkForEmail('/email-welcome'),
      },
      newUser.origin,
    );

    if (origin === UserOrigin.LUMIN) {
      this.userService.updateUserDataAfterSignUp({
        userId,
        email: respData.email,
        userName: respData.name,
        authenType: context,
        browserLanguageCode,
        createdAt: respData.createdAt,
        loginService: respData.loginService,
      });
    } else {
      try {
        await this.userService.updateUserDataAfterSignUp({
          userId,
          email: respData.email,
          userName: respData.name,
          authenType: context,
          browserLanguageCode,
          createdAt: respData.createdAt,
          loginService: respData.loginService,
        });
      } catch (error) {
        this.loggerService.error({
          context: 'updateUserDataAfterSignUp',
          error,
          extraInfo: {
            userId,
          },
        });
      }
    }

    this.eventService.createEvent({
      ...eventData,
      actor: newUser,
    });
    return {
      token,
      refreshToken,
      user: respData,
      isSignedUp: false,
    };
  }

  public async loginWithGoogleV2({
    googleEmail,
    timezoneOffset,
    browserLanguageCode,
    ipAddress,
    name,
  }: ILoginWithGoogleV2Input & { name?: string, browserLanguageCode?: string; ipAddress?: string }): Promise<any> {
    const email = googleEmail.toLowerCase();
    const userData = await this.userService.findUserByEmail(email, null);
    const eventData: ICreateEventInput = {
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
    };
    if (userData) {
      eventData.eventName = NonDocumentEventNames.PERSONAL_SIGNED_IN;
      return this.signInWithGoogle(userData, timezoneOffset, eventData, browserLanguageCode, ipAddress);
    }
    return this.signUpWithThirdParty({
      email,
      name: name || email.split('@')[0],
      timezoneOffset,
      eventData,
      loginType: LOGIN_TYPE.GOOGLE,
      context: AuthenType.NORMAL,
      browserLanguageCode,
      ipAddress,
    });
  }

  public async loginWithGoogle({
    idToken,
    platform,
    timezoneOffset,
    grpcClientIdentifier,
    context,
    invitationToken,
    userOrigin,
    browserLanguageCode,
    ipAddress,
  }: ILoginWithGoogleInput & { ipAddress?: string }): Promise<SignInThirdPartyPayload> {
    let tokenPayload;
    if (grpcClientIdentifier) {
      tokenPayload = await this.verifyGoogleTokenFromGrpcClient(
        idToken,
        platform,
        grpcClientIdentifier,
      );
    } else {
      tokenPayload = await this.verifyGoogleToken(idToken, platform);
    }
    const { email: googleEmail, name }: { email: string, name: string } = tokenPayload;
    const email = googleEmail.toLowerCase();
    const userData = await this.userService.findUserByEmail(email, null);
    const eventData: ICreateEventInput = {
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
    };
    if (userData) {
      eventData.eventName = NonDocumentEventNames.PERSONAL_SIGNED_IN;
      return this.signInWithGoogle(userData, timezoneOffset, eventData, browserLanguageCode, ipAddress, context);
    }
    return this.signUpWithThirdParty({
      email,
      name,
      timezoneOffset,
      eventData,
      context,
      loginType: LOGIN_TYPE.GOOGLE,
      userOrigin,
      invitationToken,
      browserLanguageCode,
      ipAddress,
    });
  }

  /**
   * @deprecated
 */
  private async signInWithDropbox(
    userData: User,
    timezoneOffset: number,
    eventData: ICreateEventInput,
    browserLanguageCode: string,
    ipAddress?: string,
    context?: AuthenType,
  ) {
    const tokenData: {
      _id: string,
      email: string,
    } = {
      _id: userData._id,
      email: userData.email,
    };
    const { token, refreshToken, error: authTokenError } = this.getAuthToken({ data: tokenData, isGraphqlRequest: true, ipAddress });
    if (authTokenError) {
      throw authTokenError;
    }
    this.redisService.setRefreshToken(tokenData._id, refreshToken);
    if (!isNil(userData.password)) {
      await this.userService.findOneAndUpdate({ _id: userData._id }, { $unset: { password: 1 } });
    }
    const updatedUser = await this.userService.updateUserPropertyById(userData._id, {
      isVerified: true,
      lastLogin: new Date(),
      timezoneOffset,
      lastAccess: new Date(),
      loginService: this.userService.getLoginService({ userLoginService: userData.loginService, defaultLoginService: LoginService.DROPBOX }),
    }, true, { lean: false });
    await this.userService.migratePersonalWorkspace(updatedUser);
    const respData = await this.userService.interceptUserData({ user: updatedUser, loginService: LoginService.DROPBOX });
    this.userService.updateBrowserLanguageToHubspot({ email: userData.email, languageCode: browserLanguageCode, lastLogin: userData.lastLogin });

    if (context === AuthenType.TEMPLATES_OPEN) {
      await this.organizationService.createDefaultOrganizationForOpeningTemplates(updatedUser);
    }
    this.eventService.createEvent({
      ...eventData,
      actor: userData,
    });
    return {
      token,
      refreshToken,
      user: respData,
      isSignedUp: true,
    };
  }

  public async loginWithDropbox({
    code,
    timezoneOffset,
    context,
    userOrigin,
    invitationToken,
    browserLanguageCode,
    ipAddress,
  }: ISignUpWithDropBoxInput & { ipAddress?: string }): Promise<SignInThirdPartyPayload> {
    const dropboxAccount = await this.verifyDropboxToken(code);
    const { email: dropboxEmail, name } = dropboxAccount;
    const email = dropboxEmail.toLowerCase();
    const userData = await this.userService.findUserByEmail(email, null);
    const eventData: ICreateEventInput = {
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
    };
    if (userData) {
      eventData.eventName = NonDocumentEventNames.PERSONAL_SIGNED_IN;
      return this.signInWithDropbox(userData, timezoneOffset, eventData, browserLanguageCode, ipAddress, context);
    }
    return this.signUpWithThirdParty({
      email,
      name: name.display_name,
      timezoneOffset,
      eventData,
      context,
      userOrigin,
      invitationToken,
      browserLanguageCode,
      ipAddress,
    });
  }

  public async verifyAppleToken(idToken: string, nonce: string): Promise<AppleIdTokenType> {
    return appleSignin.verifyIdToken(idToken, {
      nonce: nonce ? crypto.createHash('sha256').update(nonce).digest('hex') : undefined,
    });
  }

  public async signInUser(userId: string): Promise<SignInPayload> {
    const user = await this.userService.findUserById(userId);
    const { token, refreshToken } = this.getAuthToken({
      data: {
        _id: userId,
        email: user.email,
      },
    });

    this.redisService
      .setRefreshToken(user._id, refreshToken)
      .catch((error) => {
        this.loggerService.error({
          context: 'signInUser: set refresh token to redis',
          error,
        });
      });

    const respUser = {
      _id: userId,
      email: user.email,
      name: user.name,
      avatarRemoteId: user.avatarRemoteId,
      payment: user.payment,
      setting: user.setting,
      lastLogin: user.lastLogin,
      timezoneOffset: user.timezoneOffset,
      signatures: user.signatures,
      createdAt: user.createdAt,
      isUsingPassword: this.userService.isUserUsingPassword(user),
      endTrial: user.endTrial ? user.endTrial : null,
      metadata: user.metadata,
    };

    return {
      token,
      refreshToken,
      user: respUser,
    };
  }

  public async signInUserEmail(email: string): Promise<SignInPayload> {
    const user = await this.userService.findUserByEmail(email);
    const { token, refreshToken } = this.getAuthToken({
      data: {
        _id: user._id,
        email: user.email,
      },
    });

    this.redisService
      .setRefreshToken(user._id, refreshToken)
      .catch((error) => {
        this.loggerService.error({
          context: 'signInUserEmail: set refresh token to redis',
          error,
        });
      });

    const respUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarRemoteId: user.avatarRemoteId,
      payment: user.payment,
      setting: user.setting,
      lastLogin: user.lastLogin,
      timezoneOffset: user.timezoneOffset,
      signatures: user.signatures,
      createdAt: user.createdAt,
      isUsingPassword: this.userService.isUserUsingPassword(user),
      endTrial: user.endTrial ? user.endTrial : null,
      metadata: user.metadata,
    };

    return {
      token,
      refreshToken,
      user: respUser,
    };
  }

  private async signInWithApple(userData: User, timezoneOffset: number, eventData: ICreateEventInput, ipAddress?: string) {
    const tokenData = {
      _id: userData._id,
      email: userData.email,
    };
    const { token, refreshToken, error: authTokenError } = this.getAuthToken({ data: tokenData, isGraphqlRequest: true, ipAddress });
    if (authTokenError) {
      throw authTokenError;
    }
    this.redisService.setRefreshToken(tokenData._id, refreshToken);
    const respData = {
      _id: userData._id,
      email: userData.email,
      name: userData.name,
      avatarRemoteId: userData.avatarRemoteId,
      payment: userData.payment,
      setting: userData.setting,
      lastLogin: userData.lastLogin,
      timezoneOffset: userData.timezoneOffset,
      signatures: userData.signatures,
      createdAt: userData.createdAt,
      isUsingPassword: this.userService.isUserUsingPassword(userData),
      endTrial: null,
      metadata: userData.metadata,
      loginService: userData.loginService || LoginService.APPLE,
      newNotifications: userData.newNotifications,
    };
    const updatedUser = await this.userService.updateUserPropertyById(userData._id, {
      isVerified: true,
      lastLogin: new Date(),
      timezoneOffset,
      lastAccess: new Date(),
      loginService: this.userService.getLoginService({ userLoginService: userData.loginService, defaultLoginService: LoginService.APPLE }),
    }, true, { lean: false });
    this.eventService.createEvent({
      ...eventData,
      actor: userData,
    });
    await this.userService.migratePersonalWorkspace(updatedUser);
    return {
      token,
      refreshToken,
      user: respData,
      isSignedUp: true,
    };
  }

  private async signUpWithApple(
    email: string,
    name: string,
    appleUserId: string,
    timezoneOffset: number,
    eventData: ICreateEventInput,
    userOrigin?: string,
    ipAddress?: string,
  ) {
    const newUserData = {
      email,
      name: name || email.substring(0, 32) || 'Lumin User',
      isVerified: true,
      timezoneOffset,
      appleUserId,
      origin: userOrigin || UserOrigin.LUMIN,
      version: USER_VERSION,
      loginService: LoginService.APPLE,
    };
    const newUser = await this.userService.createUser(newUserData);
    await this.userService.migratePersonalWorkspace(newUser);
    const tokenData: {
      _id: string,
      email: string,
    } = {
      _id: newUser._id,
      email,
    };
    const { token, refreshToken, error: authTokenError } = this.getAuthToken({ data: tokenData, isGraphqlRequest: true, ipAddress });
    if (authTokenError) {
      throw authTokenError;
    }
    this.redisService.setRefreshToken(tokenData._id, refreshToken);
    const respData = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      avatarRemoteId: newUser.avatarRemoteId,
      payment: newUser.payment,
      setting: newUser.setting,
      lastLogin: newUser.lastLogin,
      timezoneOffset: newUser.timezoneOffset,
      signatures: newUser.signatures,
      createdAt: newUser.createdAt,
      isUsingPassword: this.userService.isUserUsingPassword(newUser),
      newNotifications: newUser.newNotifications,
      loginService: LoginService.APPLE,
    };
    this.emailService.sendEmail(
      EMAIL_TYPE.WELCOME,
      [respData.email],
      {
        name: respData.name,
        mobileDeeplinkUrl: this.emailService.generateDeeplinkForEmail('/email-welcome'),
      },
      newUser.origin,
    );
    this.eventService.createEvent({
      ...eventData,
      actor: newUser,
    });
    return {
      token,
      refreshToken,
      user: respData,
      isSignedUp: false,
    };
  }

  public async loginWithApple(
    idToken: string,
    nonce: string,
    timezoneOffset: number,
    name?: string,
    userOrigin?: string,
    ipAddress?: string,
  ): Promise<SignInThirdPartyPayload> {
    const appleIdTokenClaims = await this.verifyAppleToken(idToken, nonce);
    const { sub, email: appleEmail } = appleIdTokenClaims;
    const email = appleEmail.toLowerCase();
    const eventData: ICreateEventInput = {
      eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
      eventScope: EventScopes.PERSONAL,
    };
    const appleUserData = await this.userService.findUserByAppleUserId(sub, null);
    if (appleUserData) {
      eventData.eventName = NonDocumentEventNames.PERSONAL_SIGNED_IN;
      return this.signInWithApple(appleUserData, timezoneOffset, eventData, ipAddress);
    }
    const userData = await this.userService.findUserByEmail(email, null);
    if (userData) {
      // user has used same email to signup with another service
      return this.signInWithApple(userData, timezoneOffset, eventData, ipAddress);
    }
    return this.signUpWithApple(email, name, sub, timezoneOffset, eventData, userOrigin, ipAddress);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async resendVerifyEmail(user: User): Promise<{ error?: ApplicationError, tokenVerifyAccount?: string }> {
    if (user) {
      const tokenPayload = {
        _id: user._id,
        email: user.email,
        name: user.name,
        type: TOKEN_TYPE.VERIFY_ACCOUNT,
      };
      const tokenVerifyAccount = this.createToken(tokenPayload, this.environmentService.getByKey(EnvConstants.JWT_EXPIRE_VERIFY_ACCOUNT_IN));
      this.redisService.setValidVerifyToken(user.email, tokenVerifyAccount);
      const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
      const emailData = {
        verifyLink: `${baseUrl}/verify-account?token=${tokenVerifyAccount}`,
      };
      const userOrigin = user.origin ? user.origin : UserOrigin.LUMIN;
      this.emailService.sendEmail(EMAIL_TYPE.CONFIRM_EMAIL, [tokenPayload.email], emailData, userOrigin);

      if (userOrigin === UserOrigin.BANANASIGN) {
        return {
          tokenVerifyAccount,
        };
      }
      return {
        error: null,
      };
    }
    return {
      error: ServerErrorException.Internal('Error when trying to re-send verify email', ErrorCode.User.RESEND_VERIFY_EMAIL_FAIL),
    };
  }

  /**
   * @deprecated
 */
  public async forgotPassword(
    forgotPassword: ForgotPasswordInput,
  ): Promise<{ data?: ForgotPasswordPayload, error?: ApplicationError }> {
    const { email, origin } = forgotPassword;
    const existedUser = await this.userService.findUserByEmail(email);
    if (!existedUser.isVerified) {
      return {
        error: ServerErrorException.BadRequest('Your account has not been verified yet', ErrorCode.User.USER_NOT_VERIFIED),
      };
    }
    if (!existedUser.password) {
      return {
        error: ServerErrorException.BadRequest(
          'This email address is currently being used with Google, Dropbox or Microsoft',
          ErrorCode.User.THIRD_PARTY_ACCOUNT,
        ),
      };
    }
    const resetPasswordToken = this.createResetPasswordToken(existedUser);
    const userOrigin = origin || existedUser.origin || UserOrigin.LUMIN;
    this.emailService.sendEmail(
      EMAIL_TYPE.RESET_PASSWORD,
      [email],
      { token: resetPasswordToken },
      userOrigin,
    );

    if (userOrigin === UserOrigin.BANANASIGN) {
      return {
        data: {
          name: existedUser.name,
          token: resetPasswordToken,
        },
      };
    }
    return {
      error: null,
    };
  }

  public createResetPasswordToken(user: User): string {
    const tokenData = {
      _id: user._id,
      email: user.email,
      type: TOKEN_TYPE.RESET_PASSWORD,
    };

    const jwtExpireTime = Number(this.environmentService.getByKey(EnvConstants.RESET_PASSWORD_TOKEN_EXPIRE_IN)) * 1000;
    const resetPasswordToken = this.createToken(tokenData, String(jwtExpireTime));
    this.redisService.setResetPasswordToken(user.email, resetPasswordToken);
    return resetPasswordToken;
  }

  /**
   * @deprecated
 */
  public async resetPassword(payload): Promise<string> {
    const userId: string = payload.token._id;
    const resetPasswordResult = await this.userService.resetPassword(
      userId,
      payload.password as string,
    );
    this.redisService.deleteResetPasswordToken(payload.token.email as string);
    if (resetPasswordResult) {
      return userId;
    }
    return null;
  }

  public async isDuplicateRecentPassword(recentPasswords: string[], newPassword: string): Promise<boolean> {
    if (!recentPasswords || !recentPasswords.length) {
      return false;
    }
    // eslint-disable-next-line no-return-await
    const comparePassRes = await Promise.all(recentPasswords.map(async (p) => await Utils.comparePassword(newPassword, p)));
    return comparePassRes.some(Boolean);
  }

  public async signOut(userId: string, token: string, refreshToken: string, type = 'app'): Promise<boolean> {
    if (type === 'app') {
      await this.redisService.removeRefreshToken(userId, refreshToken);
    }
    const user = await this.userService.findUserById(userId);
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.PERSONAL_SIGNED_OUT,
      eventScope: EventScopes.PERSONAL,
      actor: user,
    });
    const addBlacklistToken = this.redisService.revokePermission(token);
    return addBlacklistToken;
  }

  public async adminSignIn({
    userEmail,
    password,
    timezoneOffset,
  }: {
    userEmail: string,
    password: string,
    timezoneOffset: number,
  }): Promise<AdminSignInPayload> {
    const email = userEmail?.toLowerCase();
    const prevFailedAttempts = await this.redisService.getAdminFailedAttempt(email);
    if (prevFailedAttempts >= CommonConstants.MAXIMUM_SIGN_IN_ATTEMPTS) {
      await this.throwErrorOnBlockedAdminAccount(email);
    }
    // Validate admin existence
    const admin = await this.adminService.findByEmail(email, '+password');
    if (!admin || admin.status === AdminStatus.PENDING) {
      await this.handleInvalidSignInData(email, prevFailedAttempts);
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await this.handleInvalidSignInData(email, prevFailedAttempts);
    }

    const resAdmin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      avatarRemoteId: admin.avatarRemoteId,
      status: admin.status,
    };
    const token = this.getAccessToken({
      ...resAdmin,
      userType: APP_USER_TYPE.SALE_ADMIN,
    });
    await this.redisService.setAdminAccessToken(resAdmin._id, token);
    this.adminService.updatePropertiesById(admin._id, {
      timezoneOffset,
    });
    return {
      token,
      user: resAdmin,
    };
  }

  public adminVerifyTokenWithType(token: string, type: TOKEN_TYPE): {
    tokenPayload?: Record<string, any>,
    error?: any,
  } {
    try {
      const tokenPayload = this.jwtService.verify(token);
      if (tokenPayload.type === type) {
        return { tokenPayload };
      }
      return { error: GraphErrorException.BadRequest('Invalid token') };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { error: GraphErrorException.BadRequest(ErrorCode.Common.TOKEN_EXPIRED) };
      }
      return { error };
    }
  }

  public async adminVerifyResetPasswordToken(token: string): Promise<{
    tokenPayload?: Record<string, string>,
    error?: any,
  }> {
    try {
      const { _id, email }: { _id: any, email: string } = this.jwtService.verify(token);
      const validToken = await this.redisService.getAdminResetPasswordToken(email);
      return (token === validToken)
        ? { tokenPayload: { _id, email } }
        : { error: GraphErrorException.BadRequest('Invalid token', ErrorCode.Common.TOKEN_INVALID) };
    } catch (error) {
      const isTokenExpired = error instanceof TokenExpiredError;
      const errorMessage = isTokenExpired ? ErrorCode.Common.TOKEN_EXPIRED : 'Invalid token';
      const errorCode = isTokenExpired ? ErrorCode.Common.TOKEN_EXPIRED : ErrorCode.Common.TOKEN_INVALID;
      return {
        error: GraphErrorException.BadRequest(errorMessage, errorCode),
      };
    }
  }

  public async adminVerifyCreatePasswordToken(token: string): Promise<{
    tokenPayload?: Record<string, string>,
    error?: any,
  }> {
    try {
      const { _id, email }: { _id: any, email: string } = this.jwtService.verify(token);
      const validToken = await this.redisService.getAdminCreatePasswordToken(email);
      return (token === validToken)
        ? { tokenPayload: { _id, email } }
        : { error: GraphErrorException.BadRequest('Invalid token', ErrorCode.Common.TOKEN_INVALID) };
    } catch (error) {
      const isTokenExpired = error instanceof TokenExpiredError;
      const errorMessage = isTokenExpired ? ErrorCode.Common.TOKEN_EXPIRED : 'Invalid token';
      const errorCode = isTokenExpired ? ErrorCode.Common.TOKEN_EXPIRED : ErrorCode.Common.TOKEN_INVALID;
      return {
        error: GraphErrorException.BadRequest(errorMessage, errorCode),
      };
    }
  }

  public async adminForgotPassword(email: string): Promise<void> {
    const remains = await this.redisService.getResetPasswordRemainingTimes(email);
    if (!remains) {
      throw GraphErrorException.BadRequest(
        'You\'ve reached the daily limit for resetting password. Please try again tomorrow.',
        ErrorCode.User.EXCEEDED_LIMIT_RESET_PASSWORD,
      );
    }
    const existedAdmin = await this.adminService.findByEmail(email);
    if (!existedAdmin) {
      throw GraphErrorException.NotFound('Admin not found', ErrorCode.Admin.ADMIN_NOT_FOUND);
    }
    const tokenData = {
      _id: existedAdmin._id,
      email: existedAdmin.email,
    };
    const tokenExpiryTime = Number(this.environmentService.getByKey(EnvConstants.RESET_PASSWORD_TOKEN_EXPIRE_IN)) * 1000;
    const token = this.createToken(
      tokenData,
      String(tokenExpiryTime),
    );
    const sendEmailResult = await this.emailService.sendEmail(
      EMAIL_TYPE.ADMIN_RESET_PASSWORD,
      [email],
      { name: existedAdmin.name, token },
    );
    this.redisService.setAdminResetPasswordToken(email, token);
    if (sendEmailResult?.id) {
      this.redisService.setResetPasswordRemainingTimes(email);
    }
  }

  public async adminUpdatePassword(
    payload: {
      adminId: string,
      password: string,
    },
    extraData?: Partial<IAdmin>,
  ): Promise<IAdmin> {
    const {
      adminId, password,
    } = payload;
    const newPassword = await Utils.hashPassword(password);
    return this.adminService.updatePropertiesById(
      adminId,
      {
        password: newPassword,
        ...extraData,
      },
    );
  }

  public async adminResetPassword(resetPassword: ResetPasswordInput): Promise<IAdmin> {
    const { token, password, stayLoggedIn } = resetPassword;
    const { tokenPayload, error } = await this.adminVerifyResetPasswordToken(token);
    if (error) {
      throw error;
    }

    const { _id: adminId, email } = tokenPayload;
    const validatePassword = Utils.validateAdminPassword(password);
    if (!validatePassword) {
      throw GraphErrorException.BadRequest(ErrorMessage.COMMON.INVALID_PASSWORD, ErrorCode.Common.INVALID_INPUT);
    }
    const admin = await this.adminService.findById(adminId, '+password');
    if (!admin) {
      throw GraphErrorException.NotFound('Admin not found', ErrorCode.Admin.ADMIN_NOT_FOUND);
    }
    const isOldPassword = await admin.comparePassword(password);
    if (isOldPassword) {
      throw GraphErrorException.BadRequest('New password must be different from the current password', ErrorCode.User.NEW_PASSWORD_SAME_OLD_PASSWORD);
    }

    const updatedData = await this.adminUpdatePassword({
      adminId,
      password,
    });
    this.redisService.deleteAdminResetPasswordToken(email);
    if (!stayLoggedIn) {
      this.redisService.clearAdminToken(adminId);
    }
    return updatedData;
  }

  public async adminCreatePassword(data: AdminCreatePasswordInput): Promise<IAdmin> {
    const { token, name, password } = data;
    const { tokenPayload, error } = await this.adminVerifyCreatePasswordToken(token);
    if (error) {
      throw error;
    }
    const { _id: adminId, email } = tokenPayload;
    const validatePassword = Utils.validateAdminPassword(password);
    if (!validatePassword) {
      throw GraphErrorException.BadRequest(ErrorMessage.COMMON.INVALID_PASSWORD, ErrorCode.User.INVALID_PASSWORD_INPUT);
    }
    const admin = await this.adminService.findById(adminId);
    if (!admin) {
      throw GraphErrorException.NotFound('Admin not found', ErrorCode.Admin.ADMIN_NOT_FOUND);
    }

    const updatedAdmin = await this.adminUpdatePassword({
      adminId,
      password,
    }, {
      name,
      status: AdminStatus.ACTIVE,
    });
    this.redisService.deleteAdminCreatePasswordToken(email);
    return updatedAdmin;
  }

  public async adminSignOut(adminId: string, token: string): Promise<void> {
    await this.redisService.deleteAdminToken(adminId, token);
    this.redisService.addAccessTokenToBlacklist(token);
  }

  public async verifyDropboxToken(accessToken) {
    const getTokenConfig = {
      headers: {
        authorization: `${CommonConstants.AUTHORIZATION_HEADER_BEARER} ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const dropboxAccount = await this.httpPost(
      CommonConstants.DROPBOX_GET_CURRENT_ACCOUNT_API,
      JSON.stringify(null),
      getTokenConfig,
    ) as unknown as { data : { email: string, name: { display_name: string }, email_verified: boolean } };
    if (!dropboxAccount.data.email_verified) {
      throw GraphErrorException.BadRequest('Your account has not yet been verified', ErrorCode.User.USER_NOT_VERIFIED);
    }
    return dropboxAccount.data;
  }

  public createToken(data: Record<string, any> | Buffer, tokenExp: string): string {
    const jwtToken: string = this.jwtService.sign(data, {
      expiresIn: tokenExp,
    });
    return jwtToken;
  }

  public createTokeWithoutExpire(data: Record<string, any> | Buffer): string {
    return this.jwtService.sign(data);
  }

  public getAuthToken({
    data, ipAddress, loginType, isGraphqlRequest,
  } : {
    data: any, ipAddress?: string, loginType?: string, isGraphqlRequest?: boolean
  }): { token?: string, refreshToken?: string, error?: GraphErrorException } {
    const { _id, email } = data;
    if (ipAddress) {
      const { error } = this.whitelistIPService.validateIPRequest({ isGraphqlRequest, email, ipAddress });
      if (error) {
        return { error };
      }
    }
    let dataGenToken = { _id, email };
    if (loginType && loginType === LOGIN_TYPE.GOOGLE) {
      dataGenToken = {
        ...data,
        loginType,
      };
    }

    const token = this.jwtService.sign(dataGenToken, {
      expiresIn: CommonConstants.JWT_EXPIRE_TOKEN_IN,
    });

    const refreshToken = this.jwtService.sign(dataGenToken, {
      expiresIn: this.environmentService.getByKey(EnvConstants.JWT_EXPIRE_REFRESH_TOKEN_IN),
    });

    const tokenEncoded = Utils.encryptData(token, this.cryptoKey);
    const refreshTokenEncoded = Utils.encryptData(refreshToken, this.cryptoKey);
    return { token: tokenEncoded, refreshToken: refreshTokenEncoded };
  }

  public getAccessToken(data: Record<string, unknown>): string {
    const { _id, email, userType } = data;
    const token = this.jwtService.sign({ _id, email, userType }, {
      expiresIn: CommonConstants.JWT_EXPIRE_IN,
    });
    return Utils.encryptData(token, this.cryptoKey);
  }

  public genLandingPageToken(landingPageType: string): string {
    const landingPageToken = this.jwtService.sign({ landingPageType }, {
      expiresIn: CommonConstants.JWT_EXPIRE_LANDING_PAGE_TOKEN,
    });
    return landingPageToken;
  }

  async httpPost(url: string, data, config: AxiosRequestConfig<any>) {
    // eslint-disable-next-line no-return-await
    return await this.httpService
      .post(url, data, config)
      .pipe(map((res) => res as { data: any }))
      .toPromise();
  }

  public async verifyOrgInvitationToken(token: string): Promise<{email: string, orgId: string, error?: string}> {
    try {
      const { email, orgId } = this.jwtService.verify(token) as unknown as { email: string, orgId: string };
      const inviteToken = await this.redisService.getValidInviteToken(email, orgId);
      const isUniqueToken = Boolean(inviteToken) && inviteToken === token;
      if (!isUniqueToken) {
        return {
          email,
          orgId,
          error: CommonConstants.TOKEN_EXPIRED_ERROR,
        };
      }
      return { email, orgId };
    } catch (err) {
      return { email: '', orgId: '', error: err.name };
    }
  }

  public async deleteAccount(
    { userId, fromProvisioning } :
    { userId: string; fromProvisioning?: boolean},
  ): Promise<{user: User, error?: ApplicationError}> {
    this.loggerService.info({
      context: 'info:deleteAccount',
      extraInfo: {
        userId,
      },
    });
    const user = await this.userService.findUserById(userId);
    let updatedObj = {};

    if (user.deletedAt) {
      return {
        error: ServerErrorException.BadRequest('User is being deleted', ErrorCode.Common.REQUEST_ALREADY_SENT),
        user,
      };
    }

    await this.transferOwnerPermission(user);

    const isUsingPremium = user.payment && user.payment.type !== PaymentPlanEnums.FREE;
    const subscriptionId = user.payment.subscriptionRemoteId;
    if (subscriptionId) {
      if (isUsingPremium) {
        await this.paymentService.updateStripeSubscription(subscriptionId, {
          cancel_at_period_end: true,
        }, { stripeAccount: user.payment.stripeAccountId });
        updatedObj = { ...updatedObj, 'payment.status': PaymentStatusEnums.CANCELED };
      }
    }
    updatedObj = { ...updatedObj, deletedAt: new Date() };
    const [updatedUser] = await Promise.all([
      this.userService.updateUserPropertyById(userId, updatedObj),
      this.organizationService.delInviteOrgListByEmail(user.email, AccessTypeOrganization.REQUEST_ORGANIZATION),
      this.organizationService.cancelDefaultOrganizationSubscription(user._id),
      this.organizationService.removeRequestAccessDocumentNoti(user._id),
      this.organizationService.removeRequestAccessOrgNoti(user._id),
    ]);
    await this.organizationService.leaveOrganizations(updatedUser);
    await this.userService.removeDeletedUser({ userId, fromProvisioning });
    return {
      user: updatedUser,
    };
  }

  public verifyTokenWithType(token: string, type): any {
    let tokenPayload;
    try {
      tokenPayload = this.jwtService.verify(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return {
          error: ServerErrorException.BadRequest('token expire', ErrorCode.Common.TOKEN_EXPIRED),
        };
      }
    }
    if (!tokenPayload.type || tokenPayload.type === type) {
      return {
        tokenPayload,
      };
    }
    return {
      error: ServerErrorException.BadRequest('Invalid input', ErrorCode.Common.INVALID_INPUT),
    };
  }

  /**
   * @deprecated
 */
  public async changePassword(resetPassword) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const payload = Object.assign(Object.create(Object.getPrototypeOf(resetPassword)), resetPassword);
    const { tokenPayload, error }: { tokenPayload: Record<string, string>, error: any } = this.verifyTokenWithType(
      payload.token as string,
      TOKEN_TYPE.RESET_PASSWORD,
    );
    if (error) {
      return error;
    }
    const resetPasswordToken = await this.redisService.getResetPasswordToken(tokenPayload.email);
    payload.token = tokenPayload;
    if (resetPasswordToken === resetPassword.token) {
      const validatePassword = Utils.validatePassword(payload.password as string);
      if (!validatePassword) {
        return ServerErrorException.BadRequest(
          'Password should be greater than 8 characters and less than 32 characters',
          ErrorCode.User.USER_REQUIRE_STRONG_PASSWORD,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await this.userService.findUserById(payload.token._id);
      if (!user) {
        return ServerErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
      }
      if (await Utils.comparePassword(payload.password as string, user.password)) {
        return ServerErrorException.BadRequest(
          'New password must be different from the current password',
          ErrorCode.User.NEW_PASSWORD_SAME_OLD_PASSWORD,
        );
      }
      if (await this.isDuplicateRecentPassword(user.recentPasswords, payload.password as string)) {
        return ServerErrorException.BadRequest(
          'You used this password recently. Please use another password',
          ErrorCode.User.DUPLICATE_RECENT_PASSWORD,
        );
      }
      const verifyPasswordStrength = this.verifyUserPasswordStrength(user.email, payload.password as string);
      if (!verifyPasswordStrength.isVerified) {
        return ServerErrorException.BadRequest(verifyPasswordStrength.error.message, ErrorCode.User.USER_REQUIRE_STRONG_PASSWORD);
      }
      const password = await Utils.hashPassword(payload.password as string);
      const recentPasswords = [password, ...user.recentPasswords].filter(Boolean).slice(0, 3);
      await this.userService.updateUserPropertyById(payload.token._id as string, { recentPasswords });
      const userId = await this.resetPassword(payload);
      if (userId) {
        if (!payload.stayLoggedIn) {
          this.redisService.clearAllRefreshToken(userId);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.redisService.revokePermission(resetPassword.token);
        return null;
      }
      return ServerErrorException.Internal('Reset password failed', ErrorCode.User.RESET_PASSWORD_FAIL);
    }
    return ServerErrorException.Forbidden('This link has been invalid. Please try again.', ErrorCode.User.RESET_PASSWORD_INVALID_LINK);
  }

  /**
   * @deprecated
   */
  public async verifyRefreshToken(refreshToken: string): Promise<{ user?, error?: ApplicationError }> {
    try {
      const refreshTokenDecoded = Utils.decryptData(refreshToken, this.cryptoKey);
      const user = this.jwtService.verify(refreshTokenDecoded);
      const isValidRefreshToken = await this.redisService.checkRefreshToken(user._id as string, refreshToken);
      if (!isValidRefreshToken) {
        return {
          error: ServerErrorException.Forbidden('Tokens are invalid', ErrorCode.Common.TOKEN_INVALID),
        };
      }
      return {
        user,
      };
    } catch (e) {
      if (e && e.name === CommonConstants.TOKEN_EXPIRED_ERROR) {
        return {
          error: ServerErrorException.Forbidden('Session has been expired', ErrorCode.Common.TOKEN_EXPIRED),
        };
      }
      this.loggerService.error({
        context: 'verifyRefreshToken',
        stack: e.stack,
        error: e,
      });
      return {
        error: ServerErrorException.Forbidden('Tokens are invalid', ErrorCode.Common.TOKEN_INVALID),
      };
    }
  }

  /**
   * @deprecated
   */
  public async verifyTokens(accessToken: string, refreshToken: string): Promise<{ user?, error?: ApplicationError }> {
    const isTokenBlacklisted = await this.redisService.checkKeyBlackList(accessToken);
    const isRefreshTokenBlacklisted = await this.redisService.checkKeyBlackList(refreshToken);
    if (isTokenBlacklisted || isRefreshTokenBlacklisted) {
      return {
        error: ServerErrorException.Forbidden('Tokens are blacklisted', ErrorCode.Common.TOKEN_BLACKLIST),
      };
    }
    try {
      const accessTokenDecoded = Utils.decryptData(accessToken, this.cryptoKey);
      const user = this.jwtService.verify(accessTokenDecoded);
      const isValidRefreshToken = await this.redisService.checkRefreshToken(user._id as string, refreshToken);
      if (!isValidRefreshToken) {
        return {
          error: ServerErrorException.Forbidden('Tokens are invalid', ErrorCode.Common.TOKEN_INVALID),
        };
      }
      return {
        user,
      };
    } catch (_) {
      return this.verifyRefreshToken(refreshToken);
    }
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  public verifyUserPasswordStrength(email: string, password: string): {
    isVerified: boolean, error?: GraphqlException
  } {
    // Bypass since password strength are planned to be removed
    return {
      isVerified: true,
    };
    // const isStrongPasswordRequired = await this.userService.isRequireStrongPassword(email);
    // if (isStrongPasswordRequired && Utils.calculatePasswordStrength(password) !== UserPasswordStrengthEnums.STRONG) {
    //   return {
    //     error: GraphErrorException.BadRequest(
    //       'Your organization requested you to have a Strong password.',
    //       ErrorCode.User.ORGANIZATION_REQUIRE_STRONG_PASSWORD,
    //     ),
    //     isVerified: false,
    //   };
    // }
  }

  public async verifyRecaptcha({ responseKey, isLuminAuth }: { responseKey: string, isLuminAuth?: boolean }): Promise<{ success: boolean }> {
    const key = isLuminAuth ? EnvConstants.AUTH_GOOGLE_RECAPTCHA_SECRET_KEY : EnvConstants.GOOGLE_RECAPTCHA_SECRET_KEY;
    const secretKey = this.environmentService.getByKey(key);
    const verifyRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${responseKey}`;
    return fetch(verifyRecaptchaUrl, {
      method: 'post',
    })
      .then((response) => response.json())
      .then((googleResponse) => ({ success: googleResponse.success }))
      .catch(() => ({ success: false }));
  }

  public async verifyOryAuthenticationToken(token: string): Promise<Partial<Session>> {
    const session = await this.oryJwtService.verifyOryAuthenticationToken(token);
    const { email } = session?.identity?.traits || {};
    if (email) {
      const invalidSessionIds = JSON.parse(await this.redisService.getRedisValueWithKey(`${RedisConstants.INVALID_SESSION_ID}${email}`)) || [];
      if (invalidSessionIds.length && invalidSessionIds.includes(session.id)) {
        return null;
      }
    }
    return session;
  }

  public async getSession(token: string): Promise<Partial<Session>> {
    return this.oryJwtService.verifyOryAuthorizationToken(token);
  }

  public async getAuthenticationToken(cookie): Promise<Session> {
    const resp = await this.kratosService.kratosClient.toSession({ cookie, tokenizeAs: 'lumin_authentication_jwt' });
    return resp.data;
  }

  public getOryAuthorizationToken(headers: any): string {
    const oryAuthorizationToken = headers[CommonConstants.ORY_AUTHORIZATION_HTTP_REQUEST_HEADER] as string;
    if (!oryAuthorizationToken) {
      throw Error('Missing authorization token');
    }
    return oryAuthorizationToken.split(' ')[1];
  }

  public getOryAuthenticationTokenRpc(metadata: Metadata): string {
    const oryAuthenticationToken = metadata.get(CommonConstants.ORY_AUTHORIZATION_RPC_REQUEST_METADATA)[0] as string;
    if (!oryAuthenticationToken) {
      throw Error('Missing authentication token');
    }
    return oryAuthenticationToken.split(' ')[1];
  }

  public async deleteIdentity(id: string): Promise<any> {
    await this.kratosService.kratosAdmin.deleteIdentity({ id });
  }

  public async verifyRecaptchaV3(responseKey: string) {
    const secretKey = this.environmentService.getByKey(EnvConstants.GOOGLE_RECAPTCHA_V3_SECRET_KEY);
    const verifyRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${responseKey}`;
    return fetch(verifyRecaptchaUrl, {
      method: 'post',
    })
      .then((response) => response.json())
      .then((googleResponse) => ({ response: googleResponse }));
  }

  public async sendNotificationFirstLoginUser(joinOrgInvitations: IRequestAccess[]): Promise<void> {
    await Promise.all(
      joinOrgInvitations.map(async (invitation) => {
        const [inviter, organization] = await Promise.all([
          this.userService.findUserById(invitation.inviterId),
          this.organizationService.findOneOrganization({ _id: invitation.target }),
        ]);
        if (!organization) {
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const owner = await this.userService.findUserById(organization.ownerId);
        const [notification] = await this.notificationService.getNotificationsByConditions({
          actionType: NotiOrg.INVITE_JOIN,
          'entity.entityId': organization._id,
          'target.targetData.invitationList._id': invitation._id,
        });
        if (!notification) {
          await this.organizationService.notifyInviteToOrg({
            actor: inviter || owner,
            organization,
            memberList: [invitation],
            actorType: inviter ? APP_USER_TYPE.LUMIN_USER : APP_USER_TYPE.SALE_ADMIN,
          });
        }
      }),
    );
  }

  public async putContractTemporary(data: any): Promise<{ identify: string }> {
    const bananasignUrl = this.environmentService.getByKey(EnvConstants.BANANASIGN_BASE_URL);
    const xApiKey = this.environmentService.getByKey(EnvConstants.LXB_KEY).trim();
    const results = await this.httpPost(`${bananasignUrl}/contract/putContractTemporary`, { contractInfo: data }, {
      headers: {
        'X-API-KEY': xApiKey,
      },
    }) as unknown as { data: { identify: string } };
    return {
      identify: results.data.identify,
    };
  }

  public async validateRecaptcha({
    reCaptchaTokenV3,
    email,
  }: {
    reCaptchaTokenV3: string, context: any, email: string,
  }): Promise<number> {
    const { response } = await this.verifyRecaptchaV3(reCaptchaTokenV3);
    const paymentThreshold = Number(this.environmentService.getByKey(EnvConstants.PAYMENT_RECAPTCHA_V3_THRESHOLD));
    if (response.score < paymentThreshold || RECAPTCHA_V3_USER_BLACKLIST.includes(email)) {
      throw GraphErrorException.BadRequest(ErrorMessage.COMMON.RECAPTCHA_V3_VALIDATION_FAILED, ErrorCode.Common.RECAPTCHA_V3_VALIDATION_FAILED);
    }
    return response.score;
  }

  public async verifyNewUserInvitationToken(token: string): Promise<IVerifyUserInvitationResult> {
    try {
      const tokenResult = this.jwtService.verify<IUserInvitationToken>(token);
      const user = await this.userService.findUserByEmail(tokenResult.email, { _id: 1, identityId: 1, isVerified: 1 });
      const [requestAccess] = await this.organizationService.getRequestAccessByCondition({
        actor: tokenResult.email,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
        target: tokenResult.metadata.orgId,
      });
      const mergedUserData: IVerifyUserInvitationResult['data'] = merge({}, tokenResult, { metadata: { user, invitationId: requestAccess?._id } });
      switch (mergedUserData.type) {
        case UserInvitationTokenType.CIRCLE_INVITATION: {
          const [inviteToken, org] = await Promise.all([
            this.redisService.getValidInviteToken(mergedUserData.email, mergedUserData.metadata.orgId),
            this.organizationService.getOrgById(mergedUserData.metadata.orgId),
          ]);
          if (!org) {
            return {
              isSignedUp: Boolean(user),
              data: mergedUserData,
              status: InvitationTokenStatus.REMOVED,
              error: { message: 'Organization is not existed', code: ErrorCode.Common.TOKEN_INVALID },
            };
          }
          const isUniqueToken = Boolean(inviteToken) && inviteToken === token;
          const tokenData = merge({}, mergedUserData, { metadata: { orgUrl: org.url, orgName: org.name } });
          const inviteOrgData = await this.organizationService.getInviteOrgList({
            target: org._id,
            actor: tokenResult.email,
            type: AccessTypeOrganization.INVITE_ORGANIZATION,
          });
          let tokenStatus: InvitationTokenStatus;
          if (inviteOrgData.length) {
            if (isUniqueToken || tokenData.metadata.isSameUnpopularDomain) {
              tokenStatus = InvitationTokenStatus.VALID;
            } else {
              // invitation sent from the same circle
              tokenStatus = InvitationTokenStatus.EXPIRED;
            }
          } else {
            tokenStatus = InvitationTokenStatus.REMOVED;
          }
          return {
            data: tokenData,
            error: isUniqueToken ? null : { message: 'Token was removed', code: ErrorCode.Common.TOKEN_INVALID },
            isSignedUp: Boolean(user),
            status: tokenStatus,
          };
        }
        case UserInvitationTokenType.SHARE_DOCUMENT:
          // Share document token has no expire time.
          return {
            data: mergedUserData,
            error: null,
            isSignedUp: Boolean(user),
            status: InvitationTokenStatus.VALID,
          };
        default:
          throw new Error('Invalid token type!');
      }
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        const expiredTokenData = this.jwtService.decode<IUserInvitationToken>(token);
        const user = await this.userService.findUserByEmail(expiredTokenData.email, { _id: 1, identityId: 1, isVerified: 1 });
        if (expiredTokenData.type === UserInvitationTokenType.CIRCLE_INVITATION && expiredTokenData.metadata.isSameUnpopularDomain) {
          const org = await this.organizationService.getOrgById(expiredTokenData.metadata.orgId);
          if (!org) {
            return {
              isSignedUp: Boolean(user),
              data: expiredTokenData,
              status: InvitationTokenStatus.REMOVED,
              error: { message: 'Organization is not existed', code: ErrorCode.Common.TOKEN_INVALID },
            };
          }
          const tokenData = merge({}, expiredTokenData, { metadata: { user, orgUrl: org.url, orgName: org.name } });
          return {
            isSignedUp: Boolean(user),
            status: InvitationTokenStatus.VALID,
            error: null,
            data: tokenData,
          };
        }
        return {
          isSignedUp: Boolean(user),
          status: InvitationTokenStatus.EXPIRED,
          error: { message: 'Token was expired', code: ErrorCode.Common.TOKEN_EXPIRED },
          data: expiredTokenData,
        };
      }
      return {
        isSignedUp: false,
        data: null,
        error: { message: e.message, code: ErrorCode.Common.TOKEN_INVALID },
        status: InvitationTokenStatus.INVALID,
      };
    }
  }

  async transferOwnerPermission(user: User): Promise<void> {
    const [orgs, teams, orgMembers] = await Promise.all([
      this.organizationService.getOrganizationOwner(user._id),
      this.teamService.findTeamByOwner(user._id),
      this.organizationService.getOrganizationMembers(user._id),
    ]);

    const orgsWithoutOwnerRole = orgMembers.map(({ organization }) => organization);
    orgsWithoutOwnerRole.forEach(async (organization) => {
      const { _id: orgId } = organization;
      const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
      const transferredEmail = await this.redisService.getRedisValueWithKey(transferKey);
      if (transferredEmail === user.email) {
        this.adminService.stopTransferAdminProcess(organization, transferredEmail);
      }
    });

    if (!orgs.length && !teams.length) {
      return;
    }
    const promises = [];
    if (teams.length) {
      promises.push(...teams.map((team) => this.organizationTeamService.transferTeamOwner(team, user)));
    }
    if (orgs.length) {
      promises.push(...orgs.map((org) => this.organizationService.transferOrganizationOwner(org, user)));
    }
    await Promise.all(promises);
  }

  async signinWithLumin({
    code, customRedirectUri, timezoneOffset, codeVerifier,
  }: { timezoneOffset: number, code: string, customRedirectUri?: string, codeVerifier?: string}): Promise<SignInPayload & { idToken: string }> {
    const hydraPublicUrl = this.environmentService.getByKey(EnvConstants.HYDRA_PUBLIC_URL);
    const redirectUri = customRedirectUri || this.environmentService.getByKey(EnvConstants.HYDRA_LUMIN_MOBILE_REDIRECT_URL);
    const hydraClientId = this.environmentService.getByKey(EnvConstants.HYDRA_LUMIN_MOBILE_CLIENT_ID);
    const hydraClientSecret = this.environmentService.getByKey(EnvConstants.HYDRA_LUMIN_MOBILE_CLIENT_SECRET);
    const tokenRequestData: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      client_id: hydraClientId,
      client_secret: hydraClientSecret,
      redirect_uri: redirectUri,
    };
    if (codeVerifier) {
      tokenRequestData.code_verifier = codeVerifier;
    }

    let hydraResp: any;
    try {
      hydraResp = await this.httpService.axiosRef
        .post(
          `${hydraPublicUrl}/oauth2/token`,
          stringify(tokenRequestData),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ) as any;
    } catch (error) {
      const hydraError = extractHydraError(error);

      this.loggerService.warn({
        context: 'signinWithLumin',
        message: hydraError.errorMessage,
        error: hydraError.errorMessage,
        errorCode: hydraError.errorCode,
        extraInfo: {
          url: hydraError.url,
          method: hydraError.method,
          responseData: hydraError.responseData,
          statusCode: hydraError.statusCode,
          codePrefix: code?.substring(0, 20),
          hasCodeVerifier: Boolean(codeVerifier),
          redirectUri,
        },
        stack: hydraError.stack,
      });

      throw GraphErrorException.UnprocessableError(
        hydraError.errorMessage,
        ErrorCode.Common.THIRD_PARTY_ERROR,
        {
          hydraError: hydraError.errorCode,
          statusCode: hydraError.statusCode,
        },
      );
    }

    const tokenData = this.jwtService.decode(hydraResp.data.id_token as string);
    const userData = await this.userService.findUserByEmail(tokenData.email as string);
    // First login user
    // eslint-disable-next-line no-restricted-globals
    const isFirstLogin = isNaN(userData.timezoneOffset);
    if (isFirstLogin) {
      if (timezoneOffset) {
        await this.userService.updateUserPropertyById(userData._id, { timezoneOffset });
      }
      const requestAccesses = await this.organizationService.getInviteOrgList({
        actor: userData.email, type: AccessTypeOrganization.INVITE_ORGANIZATION,
      });
      if (!isEmpty(requestAccesses)) {
        await this.sendNotificationFirstLoginUser(requestAccesses);
      }
    }
    const respUser = await this.userService.interceptUserData({ user: userData, loginService: userData.loginService });
    const { token, refreshToken } = this.getAuthToken({ data: respUser });
    this.redisService.setRefreshToken(userData._id, refreshToken);
    respUser.isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(respUser as User);
    return {
      user: respUser,
      refreshToken,
      token,
      idToken: hydraResp.data.id_token,
    };
  }

  async validateResendVerificationMail(email: string):Promise<{
    isAccept: boolean,
    error?: {
      message: string;
      code: string;
      metadata?: {
        remainingTime: number;
      }
    }
  }> {
    if (!Utils.validateEmail(email)) {
      return {
        isAccept: false,
        error: {
          message: 'Email is invalid',
          code: ErrorCode.User.INVALID_EMAIL,
        },
      };
    }
    const isVerifyEmailSent = await this.redisService.getRedisValueWithKey(`${RedisConstants.VERIFY_EMAIL_SENT}${email}`);
    if (isVerifyEmailSent) {
      const remainingTime = await this.redisService.getKeyTTL(`${RedisConstants.VERIFY_EMAIL_SENT}${email}`);
      return {
        isAccept: false,
        error: {
          message: 'Verify email has been sent',
          code: ErrorCode.Common.REQUEST_ALREADY_SENT,
          metadata: {
            remainingTime,
          },
        },
      };
    }
    return { isAccept: true };
  }

  async authenticateFromMobile(request: any, isGraphqlRequest: boolean): Promise<{
    isAccept?: boolean,
    error?: HttpErrorException | GraphErrorException,
  }> {
    const authHeader = request.headers[CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER];
    const refreshTokenHeader = request.headers[CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER];
    const tokenParams = Utils.parseAuthHeader(authHeader.trim());
    const refreshTokenParams = Utils.parseAuthHeader(refreshTokenHeader.trim());
    const ipAddress = Utils.getIpRequest(request);
    if (!tokenParams
      || !refreshTokenParams
      || tokenParams.scheme !== CommonConstants.AUTHORIZATION_HEADER_BEARER
      || refreshTokenParams.scheme !== CommonConstants.AUTHORIZATION_HEADER_BEARER
    ) {
      return {
        error: isGraphqlRequest
          ? GraphErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID)
          : HttpErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID),
      };
    }
    const checkTokenBlacklist = await this.redisService.checkKeyBlackList(tokenParams.value);
    const checkRefreshTokenBlacklist = await this.redisService.checkKeyBlackList(refreshTokenParams.value);
    if (checkTokenBlacklist || checkRefreshTokenBlacklist) {
      return {
        error: isGraphqlRequest
          ? GraphErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID)
          : HttpErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID),
      };
    }
    try {
      const { error, decoded } = await this.validateRefreshToken(refreshTokenHeader as string, isGraphqlRequest, ipAddress);
      if (error) {
        return { error };
      }
      request.user = await this.userService.findUserById(decoded._id as string);
      const isValidRequestFromMobile = await Utils.isRequestFromMobile(request as IGqlRequest);
      if (isValidRequestFromMobile) {
        return { isAccept: true };
      }
      return {
        error: isGraphqlRequest
          ? GraphErrorException.Unauthorized('Invalid x-mb request', ErrorCode.Common.INVALID_REQUEST_HEADER)
          : HttpErrorException.BadRequest('Invalid x-mb request', ErrorCode.Common.INVALID_REQUEST_HEADER),
      };
    } catch (e) {
      if (e && e.name === CommonConstants.TOKEN_EXPIRED_ERROR) {
        return {
          error: isGraphqlRequest
            ? GraphErrorException.Unauthorized('Session has been expired', ErrorCode.Common.TOKEN_EXPIRED)
            : HttpErrorException.Unauthorized('Session has been expired', ErrorCode.Common.TOKEN_EXPIRED),
        };
      }
      if (
        // eslint-disable-next-line camelcase
        (typeof e.error_code === 'function' && e.error_code() === ErrorCode.Common.INVALID_IP_ADDRESS)
        || e.code === ErrorCode.Common.INVALID_REQUEST_HEADER) {
        return { error: e };
      }
      if (typeof e.getErrorCode === 'function' && e.getErrorCode() === ErrorCode.Common.INVALID_IP_ADDRESS) {
        return { error: e };
      }
      return {
        error: isGraphqlRequest
          ? GraphErrorException.Unauthorized('Authentication Error')
          : HttpErrorException.Unauthorized('Authentication Error'),
      };
    }
  }

  async validateRefreshToken(refreshTokenHeader: string, isGraphqlRequest: boolean, ipAddress: string): Promise<{
    error?: GraphErrorException | HttpErrorException,
    decoded?: any,
  }> {
    const refreshTokenParams = Utils.parseAuthHeader(refreshTokenHeader.trim());
    const decodeRefreshTokenFromClient = Utils.decryptData(refreshTokenParams.value, this.cryptoKey);
    const decoded = this.jwtService.verify(decodeRefreshTokenFromClient);
    const isValidRefreshToken = await this.redisService.checkRefreshToken(decoded._id as string, refreshTokenParams.value);
    if (!isValidRefreshToken) {
      return {
        error: isGraphqlRequest
          ? GraphErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID)
          : HttpErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID),
      };
    }
    const { error: ipAddressError } = this.whitelistIPService.validateIPRequest({ isGraphqlRequest, email: decoded.email, ipAddress });
    if (ipAddressError) {
      return { error: ipAddressError };
    }
    return { decoded };
  }

  revokeSession(sessionId: string): Promise<any> {
    return this.kratosService.kratosAdmin.disableSession({ id: sessionId }).then(() => {
      this.messageGateway.server
        .to(`${SOCKET_NAMESPACE.USER_ROOM}-${sessionId}`)
        .emit(SOCKET_MESSAGE.USER_LOGOUT);
    }).catch((error) => this.loggerService.error({
      context: 'revokeSession',
      ...this.loggerService.getCommonErrorAttributes(error),
    }));
  }

  async validateSession(session: Partial<Session>): Promise<void> {
    const hasBeenDeletedRecently = await this.redisService.hasIdentityDeletedRecently(session.identity.id);
    if (hasBeenDeletedRecently) {
      throw GraphErrorException.Unauthorized('User has been deleted recently', ErrorCode.Common.SESSION_EXPIRED);
    }
  }

  /**
   * Fallback in case registration hook failed to create user in our DB
   */
  async newUserFromExistingKratosSession(session: Partial<Session>): Promise<User> {
    await this.validateSession(session);
    await this.newUserFromKratos({
      identityId: session.identity.id,
      email: session.identity.traits.email,
      name: session.identity.traits.name,
      // If the user is authenticated with OIDC then isVerified: true
      // else check for verifiable_addresses to see if the user is verified
      isVerified:
          [LoginService.APPLE, LoginService.DROPBOX, LoginService.GOOGLE].includes(session.identity.traits.loginService as LoginService)
        || session.identity.verifiable_addresses.some((v) => v.verified),
      // Map loginService from Kratos to mongodb
      loginType: session.identity.traits.loginService,
    });
    return this.userService.findUserByIdentityId(session.identity.id);
  }

  async getCredentialsFromOpenGoogle(credentialsId: string, ipAddress: string): Promise<CredentialsFromOpenGooglePayload> {
    const credentials = await this.redisService.getCredentialsFromOpenGoogle(credentialsId, ipAddress);
    if (!credentials) {
      throw GraphErrorException.BadRequest('Invalid credentialsId', ErrorCode.Common.INVALID_INPUT);
    }
    return credentials;
  }

  getUserLoginServiceForKratosActions(user: User) {
    // Cover the old user has wrong data(has no password field but loginService is EMAIL_PASSWORD)
    if (!user.password && user.loginService === LoginService.EMAIL_PASSWORD && !user.identityId) {
      return UNKNOWN_THIRD_PARTY;
    }
    if (user.password && !user.loginService) {
      return LoginService.EMAIL_PASSWORD;
    }
    return user.loginService;
  }

  async handleKratosRegistrationFlowCallbackV2(data: HandleKratosRegistrationCallbackDto): Promise<{ isAccept: boolean; error?: any }> {
    const { email, loginType: loginService, identityId } = data;

    // check if SSO is enabled for this email domain by the organization
    const emailDomain = Utils.getEmailDomain(email);
    const oryOrganizationsData = await this.kratosService.getOryOrganizationByDomain(emailDomain);
    if (oryOrganizationsData.organizations.length > 0) {
      return {
        isAccept: false,
        error: {
          code: ErrorCode.User.SSO_IS_ENABLED_FOR_EMAIL_DOMAIN,
          message: 'SSO is enabled for this email domain by the organization',
        },
      };
    }

    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
    if (existedBlacklist) {
      return {
        isAccept: false,
        error: {
          code: ErrorCode.User.EMAIL_IS_BANNED,
          message: 'This email is banned',
        },
      };
    }
    if (loginService !== LoginService.EMAIL_PASSWORD) {
      const { error } = await this.verifyEmailOfOIDCRegistration(email, loginService);
      if (error) {
        return {
          isAccept: false,
          error,
        };
      }
    }

    if (loginService === LoginService.SAML_SSO) {
      return { isAccept: true };
    }

    const linkedWithExistingEmail = await this.linkExistingEmailWithKratosIdentity({
      email, identityId, loginService, name: data.name,
    });
    if (!linkedWithExistingEmail) {
      await this.newUserFromKratos(data);
    }
    return { isAccept: true };
  }

  async verifyEmailOfOIDCRegistration(email: string, loginServiceFromKratos: LoginService): Promise<{ error: {
    code: string;
    metadata: Record<string, any>
  } }> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return { error: null };
    }
    const loginServiceFromLumin = this.getUserLoginServiceForKratosActions(user);
    const hasIdentityId = Boolean(user.identityId);

    if (loginServiceFromKratos === LoginService.SAML_SSO && hasIdentityId) {
      return { error: null };
    }

    if (loginServiceFromLumin !== loginServiceFromKratos && hasIdentityId) {
      return {
        error: {
          code: ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
          metadata: {
            loginService: loginServiceFromLumin,
          },
        },
      };
    }

    return { error: null };
  }

  async linkExistingEmailWithKratosIdentity({
    email, identityId, loginService, name,
  }: {
    email: string; identityId: string, loginService: LoginService, name: string,
  }): Promise<boolean> {
    if (await this.tryLinkExistingEmailWithKratosIdentity(email, identityId)) {
      const user = await this.userService.findUserByEmail(email);

      const updatedUser:
      { loginService: LoginService; $unset?: { password: number }; name?: string } = loginService !== LoginService.EMAIL_PASSWORD && user.password
        ? { loginService, $unset: { password: 1 } } : { loginService };
      if (name && name !== user.name) {
        updatedUser.name = name;
      }
      await this.userService.findOneAndUpdate({ _id: user._id }, updatedUser);
      return true;
    }
    return false;
  }

  async deleteIdentityByEmail(email: string): Promise<void> {
    return this.kratosService.deleteIdentityByEmail(email);
  }

  deleteUserIdentity(user: User): Promise<boolean> {
    return this.kratosService.deleteUserIdentity(user);
  }

  async changeEmailOnKratos({ user, newEmail, markAsVerified = false }: { user: User; newEmail: string; markAsVerified?: boolean }): Promise<void> {
    if (user.loginService === LoginService.EMAIL_PASSWORD) {
      const { data } = await this.kratosService.kratosAdmin.getIdentity({ id: user.identityId });
      const { traits, verifiable_addresses: verifiableAddress } = data;
      try {
        await this.kratosService.kratosAdmin.updateIdentity({
          id: user.identityId,
          updateIdentityBody: {
            schema_id: this.environmentService.getByKey(EnvConstants.KRATOS_SCHEMA_ID as string) || 'user_v0',
            state: 'active',
            traits: {
              ...traits,
              email: newEmail,
            },
          },
        }) as any;
        const payload: { id: string; jsonPatch: JsonPatch[] } = {
          id: user.identityId,
          jsonPatch: [
            {
              op: 'replace',
              path: '/verifiable_addresses/0/verified',
              from: '/verifiable_addresses/0/verified',
              value: markAsVerified ? true : verifiableAddress[0].verified,
            },
            {
              op: 'replace',
              path: '/verifiable_addresses/0/status',
              from: '/verifiable_addresses/0/status',
              value: markAsVerified ? 'completed' : verifiableAddress[0].status,
            },
            {
              op: 'replace',
              path: '/verifiable_addresses/0/verified_at',
              from: '/verifiable_addresses/0/verified_at',
              value: new Date(),
            },
          ],
        };
        await this.kratosService.kratosAdmin.patchIdentity(payload);
      } catch (err: any) {
        this.loggerService.error({
          error: err,
          context: 'changeUserEmail:EmailPassword',
        });
      }
      return;
    }
    await this.kratosService.kratosAdmin.deleteIdentity({ id: user.identityId }).then(async () => {
      await this.userService.findOneAndUpdate({ _id: user._id }, { $unset: { identityId: 1 } });
    }).catch((error) => this.loggerService.error({
      error,
      context: 'changeUserEmail:OIDC',
    }));
  }

  ensureSessionWithVerifiedEmail(session: Partial<Session>): void {
    const { email } = session.identity.traits;
    const verifiableAddresses = session.identity.verifiable_addresses.find(({ value }) => value === email);
    if (!verifiableAddresses?.verified) {
      throw GraphErrorException.Unauthorized('Authentication Error');
    }
  }

  async getFormFieldDetectionUsage(userId: string): Promise<{ usage: number; blockTime: number; isExceeded: boolean }> {
    try {
      return await this.redisService.getFormFieldDetectionUsage(userId);
    } catch (error) {
      this.loggerService.error({
        context: this.getFormFieldDetectionUsage.name,
        message: `Failed to get form field detection usage for user: ${userId}`,
        error,
      });
      return null;
    }
  }

  async getAutoDetectionUsage(userId: string): Promise<{ usage: number; blockTime: number }> {
    try {
      return await this.redisService.getAutoDetectionUsage(userId);
    } catch (error) {
      this.loggerService.error({
        context: this.getAutoDetectionUsage.name,
        message: `Failed to get auto detection usage for user: ${userId}`,
        error,
      });
      return null;
    }
  }

  private async createRecaptchaAssessment(
    { responseKey, expectedAction, siteKeyEnv }:
    { responseKey: string, expectedAction: string, siteKeyEnv: string },
  ): Promise<{
    error?: Error,
    assessment?: RecaptchaProtos.google.cloud.recaptchaenterprise.v1.IAssessment,
  }> {
    if (!this.recaptchaEnterpriseClient) {
      this.loggerService.error({
        context: this.createRecaptchaAssessment.name,
        message: 'Recaptcha enterprise client not initialized',
      });
      return {
        error: new Error('Recaptcha enterprise client not initialized'),
      };
    }

    const projectId = this.environmentService.getByKey(EnvConstants.GCLOUD_RECAPTCHA_PROJECT_ID);
    const projectPath = this.recaptchaEnterpriseClient.projectPath(projectId);
    const siteKey = this.environmentService.getByKey(siteKeyEnv);

    const [assessment] = await this.recaptchaEnterpriseClient.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          siteKey,
          token: responseKey,
          expectedAction,
        },
      },
    });

    return { assessment };
  }

  public async verifyRecaptchaAuth({ responseKey, expectedAction }: { responseKey: string, expectedAction: string }): Promise<{ success: boolean }> {
    const { error, assessment } = await this.createRecaptchaAssessment({
      responseKey,
      expectedAction,
      siteKeyEnv: EnvConstants.GCLOUD_RECAPTCHA_AUTH_SITE_KEY,
    });
    if (error) {
      throw GrpcErrorException.ApplicationError(
        ServerErrorException.Internal(error.message, ErrorCode.Common.RECAPTCHA_ENTERPRISE_CLIENT_NOT_INITIALIZED),
      );
    }
    const { tokenProperties, riskAnalysis } = assessment;
    const score = riskAnalysis?.score ?? 0;
    if (!tokenProperties?.valid || tokenProperties.action !== expectedAction || score < 0.5) {
      return { success: false };
    }

    return { success: true };
  }

  public async validateRecaptchaEnterprise({
    reCaptchaTokenV3,
    email,
    expectedAction,
  }: {
    reCaptchaTokenV3: string,
    email: string,
    expectedAction: string,
  }): Promise<number> {
    const { error, assessment } = await this.createRecaptchaAssessment({
      responseKey: reCaptchaTokenV3,
      expectedAction,
      siteKeyEnv: EnvConstants.GCLOUD_RECAPTCHA_WEB_SITE_KEY,
    });
    if (error) {
      throw GraphErrorException.InternalServerError(
        error.message,
        ErrorCode.Common.RECAPTCHA_ENTERPRISE_CLIENT_NOT_INITIALIZED,
      );
    }
    const paymentThreshold = Number(this.environmentService.getByKey(EnvConstants.PAYMENT_RECAPTCHA_V3_THRESHOLD));
    const score = assessment.riskAnalysis?.score ?? 0;
    if (score < paymentThreshold || RECAPTCHA_V3_USER_BLACKLIST.includes(email)) {
      throw GraphErrorException.BadRequest(ErrorMessage.COMMON.RECAPTCHA_V3_VALIDATION_FAILED, ErrorCode.Common.RECAPTCHA_V3_VALIDATION_FAILED);
    }
    return score;
  }

  async linkSamlLoginService(data: { identityId: string }): Promise<void> {
    const { identityId } = data;
    const user = await this.userService.findUserByIdentityId(identityId);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    await this.userService.updateUserByIdentityId(identityId, {
      loginService: LoginService.SAML_SSO,
      previousLoginService: user.loginService,
    });
  }

  async unlinkSamlLoginService({ userId }: { userId: string }): Promise<void> {
    const user = await this.userService.findUserById(userId);
    if (!user || (user && (user.loginService !== LoginService.SAML_SSO || !user.previousLoginService))) {
      return;
    }

    const { identityId } = user;
    const { data: identity } = await this.kratosService.kratosAdmin.getIdentity({ id: identityId });
    const samlCredentials = get(identity, 'credentials.saml', {}) as IdentityCredentials;
    if (!samlCredentials) {
      this.loggerService.warn({
        context: this.unlinkSamlLoginService.name,
        message: `SAML credentials not found for user: ${user._id}`,
        extraInfo: {
          userId,
          identityId,
        },
      });
      return;
    }
    await this.kratosService.kratosAdmin.deleteIdentityCredentials({ id: identityId, type: 'saml', identifier: samlCredentials.identifiers[0] });
    await this.kratosService.kratosAdmin.patchIdentity({
      id: identityId,
      jsonPatch: [
        {
          op: 'replace',
          path: '/traits/loginService',
          value: user.previousLoginService,
        },
        {
          op: 'replace',
          path: '/organization_id',
          value: null,
        },
      ],
    });
    await this.userService.findOneAndUpdate({ _id: user._id }, {
      loginService: user.previousLoginService,
      $unset: { previousLoginService: 1 },
    });
  }
}
