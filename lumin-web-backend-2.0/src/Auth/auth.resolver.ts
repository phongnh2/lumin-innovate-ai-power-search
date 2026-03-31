/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/extensions */
import {
  HttpStatus, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  Args, Mutation, Resolver, Query, Context,
} from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as human from 'humanparser';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_TYPE } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { NotiOrg } from 'Common/constants/NotificationConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { USER_TYPE } from 'Common/constants/UserConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesInterceptor } from 'CustomRules/custom.rules.interceptor';

import { AdminService } from 'Admin/admin.service';
import { AuthService } from 'Auth/auth.service';
import { AdminAuthGuard } from 'Auth/guards/admin.auth.guard';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IUserInvitationToken } from 'Auth/interfaces/auth.interface';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { BrazeService } from 'Braze/braze.service';
import { TESTING_URL } from 'constant';
import { DocumentService } from 'Document/document.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import {
  SignUpInput,
  SignInPayload,
  SignUpPayload,
  SignInByGoogleInput,
  VerifyEmailInput,
  VerifyEmailPayload,
  ResendVerifyEmailInput,
  SignInByDropboxInput,
  SignInByAppleInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SignOutInput,
  VerifyTokenInput,
  CheckResetPasswordInput,
  SignUpInvitationInput,
  BasicResponse,
  VerifyPasswordPayload,
  CheckLoginExternalPayload,
  GetLandingPageTokenPayload,
  UpdateUserTypePayload,
  VerifySharingDocPayload,
  SignInThirdPartyPayload,
  InviteOrgVerificationPayload,
  VerifyTokenPayload,
  SignInInput,
  AdminSignInPayload,
  AdminVerifyTokenPayload,
  AdminCreatePasswordInput,
  AdminPayload,
  ExchangeGoogleTokenPayload,
  GoogleToken,
  SignInByGoogleInputV2,
  SignInThirdPartyPayloadV2,
  SigninWithLuminPayload,
  VerifyInvitationTokenPayload,
  CredentialsFromOpenGooglePayload,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { AccessTypeOrganization } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';
import { UserTrackingService } from 'UserTracking/tracking.service';

import { APP_USER_TYPE, TOKEN_TYPE } from './auth.enum';
import { GqlAttachUserGuard } from './guards/graph.attachUser';
import { WhitelistIPService } from './whitelistIP.sevice';

@Resolver('Auth')
export class AuthResolver {
  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  minimumExperimentalUserId = this.environmentService.getByKey(EnvConstants.MINIMUM_EXPERIMENTAL_USER_ID_FOR_DATA_COLLECTION);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly environmentService: EnvironmentService,
    private readonly userTrackingService: UserTrackingService,
    private readonly documentService: DocumentService,
    private readonly organizationService: OrganizationService,
    private readonly adminService: AdminService,
    private readonly blacklistService: BlacklistService,
    private readonly loggerService: LoggerService,
    private readonly notificationService: NotificationService,
    private readonly whitelistIpService: WhitelistIPService,
    private readonly brazeService: BrazeService,
    private readonly customRuleLoader: CustomRuleLoader,
  ) { }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(CustomRulesInterceptor, LoggingInterceptor, SanitizeInputInterceptor)
  @Mutation()
  async signUpWithInvite(@Args('input') signUpUser: SignUpInvitationInput, @Context() context): Promise<SignUpPayload> {
    if (!signUpUser.invitationToken) {
      throw GraphErrorException.BadRequest('Invitation token required', ErrorCode.Common.INVALID_INPUT);
    }
    const { email, orgId }: { email: string, orgId: string } = this.jwtService.verify(signUpUser.invitationToken);
    const ipAddress = Utils.getIpRequest(context.req);
    const { error: requestIpError } = this.whitelistIpService.validateIPRequest({ isGraphqlRequest: true, email, ipAddress });
    if (requestIpError) {
      throw requestIpError;
    }
    const signUpUserPayload = <SignUpInput>{
      ...signUpUser,
      email,
    };
    const { signUpData, error } = this.authService.destructSignUpInput(signUpUserPayload);
    if (error) {
      throw GraphErrorException.ApplicationError(error);
    }

    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
    if (existedBlacklist) {
      throw GraphErrorException.NotAcceptable('This email is banned', ErrorCode.User.EMAIL_IS_BANNED);
    }
    const verifyPasswordStrength = this.authService.verifyUserPasswordStrength(signUpData.email, signUpData.password);

    if (!verifyPasswordStrength.isVerified) {
      throw verifyPasswordStrength.error;
    }
    const [invitation] = await this.organizationService.getRequestAccessByCondition({
      actor: email,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
      target: orgId,
    });
    const { user, error: signUpError } = await this.authService.signUpWithInvite({
      signUpUser: signUpData, shouldCreateDefaultOrg: Boolean(invitation),
    });
    // Attach sign up user to handle some custom logic in custom.rules.interceptors.ts
    context.req.signUpUser = user;
    if (signUpError) {
      throw GraphErrorException.ApplicationError(signUpError);
    }

    await this.userTrackingService.createContact(
      {
        email: user.email,
        user_from_invited: 'Yes',
        receive_marketing_email: 'Yes',
        api_key_user_ever: 'false',
        ...(signUpData.browserLanguageCode && { browser_language: this.userService.getLanguageDisplayName(signUpData.browserLanguageCode) }),
      },
    );

    const { firstName, middleName, lastName } = human.parseName(user.name);
    const lastname = [middleName, lastName].filter(Boolean).join(' ');
    await this.brazeService.upsertAudience([{
      email,
      external_id: user._id,
      first_name: firstName,
      last_name: lastname,
    }]);
    // Set redis key to distinct invitation sign-up action with regular one
    this.redisService.setInvitationSignUp(email, orgId);
    return {
      message: 'Success',
      statusCode: HttpStatus.OK,
      userId: user._id,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS, RateLimiterStrategy.EMAIL)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query()
  adminSignIn(
    @Args('input') adminSignInInput: SignInInput,
  ): Promise<AdminSignInPayload> {
    const { email, password, timezoneOffset } = adminSignInInput;
    return this.authService.adminSignIn({
      userEmail: email,
      password,
      timezoneOffset,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async signInByApple(
    @Args('input') signInApple: SignInByAppleInput,
    @Context() context,
  ): Promise<SignInThirdPartyPayload> {
    const ipAddress = Utils.getIpRequest(context.req);
    const {
      idToken, name = '', nonce, timezoneOffset,
    } = signInApple;
    const response = await this.authService.loginWithApple(idToken, nonce, timezoneOffset, name, ipAddress);
    return response;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(CustomRulesInterceptor, LoggingInterceptor, SanitizeInputInterceptor)
  @Mutation()
  async signInByGoogle(
    @Args('input') signInByGoogle: SignInByGoogleInput,
    @Context() resolverContext,
  ): Promise<SignInThirdPartyPayload> {
    const ipAddress = Utils.getIpRequest(resolverContext.req);
    const {
      idToken, platform, timezoneOffset, context, invitationToken, browserLanguageCode,
    } = signInByGoogle;

    const payload = await this.authService.loginWithGoogle({
      idToken,
      platform,
      timezoneOffset,
      context,
      invitationToken,
      browserLanguageCode,
      ipAddress,
    });

    if (!payload.isSignedUp) {
    // Attach sign up user to handle some custom logic in custom.rules.interceptors.ts
      resolverContext.req.signUpUser = payload.user;
    } else {
      resolverContext.req.user = payload.user;
    }

    return payload;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Mutation()
  async verifyEmail(@Args('input') input: VerifyEmailInput): Promise<VerifyEmailPayload> {
    const { tokenPayload, error }: {
      tokenPayload: {
        email: string, _id: string, name: string },
      error: any } = this.authService.verifyTokenWithType(input.token, TOKEN_TYPE.VERIFY_ACCOUNT);
    if (error) {
      if (error.message === ErrorCode.Common.TOKEN_EXPIRED) {
        return {
          email: this.jwtService.verify(input.token, { ignoreExpiration: true }).email,
          message: ErrorCode.Common.TOKEN_EXPIRED,
          statusCode: HttpStatus.CONFLICT,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GraphErrorException.ApplicationError(error);
    }
    const validVerifyToken = await this.redisService.getValidVerifyToken(tokenPayload.email);
    if (validVerifyToken && validVerifyToken !== input.token) {
      throw GraphErrorException.BadRequest('Invalid token', ErrorCode.Common.TOKEN_INVALID);
    }
    const validateEmail = Utils.validateEmail(tokenPayload.email);
    if (!validateEmail) {
      throw GraphErrorException.BadRequest('Email is not valid', ErrorCode.User.INVALID_EMAIL);
    }

    const result = await this.userService.verifyUserAccount(tokenPayload._id);
    const respUser = await this.userService.findUserByEmail(tokenPayload.email);
    if (result) {
      const landingPageToken = await this.redisService.getRedisValueWithKey(`ltk:${respUser._id}`);
      if (landingPageToken) {
        this.userService.handleUserFromlanding(respUser?._id, respUser?.name, landingPageToken);
        this.redisService.deleteRedisByKey(`ltk:${respUser?._id}`);
      }
      const openTemplateData = await this.redisService.getOpenFormFromTemplates(respUser._id);
      if (openTemplateData) {
        await this.organizationService.createCustomOrganization(respUser);
      }

      this.emailService.sendEmail(
        EMAIL_TYPE.WELCOME,
        [tokenPayload.email],
        {
          name: tokenPayload.name,
          mobileDeeplinkUrl: this.emailService.generateDeeplinkForEmail('/email-welcome'),
        },
      );

      this.redisService.delValidVerifyToken(tokenPayload.email);

      return {
        email: tokenPayload.email,
        message: 'Verification successful!',
        statusCode: HttpStatus.OK,
      };
    }
    return {
      email: tokenPayload.email,
      message: 'Your email address was successfully verified',
      statusCode: HttpStatus.CONFLICT,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation()
  async resendVerifyEmail(
    @Args('input') resendVerifyEmail: ResendVerifyEmailInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const ipAddress = Utils.getIpRequest(context.req);
    const { email } = resendVerifyEmail;
    if (!email) {
      throw GraphErrorException.BadRequest('Invalid input', ErrorCode.Common.INVALID_INPUT);
    }
    if (!Utils.validateEmail(email)) {
      throw GraphErrorException.BadRequest('Email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    const { error: requestIpError } = this.whitelistIpService.validateIPRequest({ isGraphqlRequest: true, email, ipAddress });
    if (requestIpError) {
      throw requestIpError;
    }
    const isVerifyEmailSent = await this.redisService.getRedisValueWithKey(`${RedisConstants.VERIFY_EMAIL_SENT}${email}`);
    if (isVerifyEmailSent) {
      const remainingTime = await this.redisService.getKeyTTL(`${RedisConstants.VERIFY_EMAIL_SENT}${email}`);
      throw GraphErrorException.BadRequest(
        'Verify email has been sent',
        ErrorCode.Common.REQUEST_ALREADY_SENT,
        { remainingTime },
      );
    }

    const user = await this.userService.findUserByEmail(email);

    if (!user) throw GraphErrorException.BadRequest('User not found.', ErrorCode.User.USER_NOT_FOUND);
    if (user.isVerified) throw GraphErrorException.BadRequest('User has been verified.', ErrorCode.User.USER_ALREADY_VERIFIED);

    const { error } = await this.authService.resendVerifyEmail(user);
    if (error) {
      throw GraphErrorException.InternalServerError('Error when trying to re-send verify email', ErrorCode.User.RESEND_VERIFY_EMAIL_FAIL);
    }
    return {
      message: `A new confirmation email has been sent to ${user.email}`,
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async signInByDropbox(
    @Args('input') signInDropbox: SignInByDropboxInput,
    @Context() context,
  ): Promise<SignInThirdPartyPayload> {
    const ipAddress = Utils.getIpRequest(context.req);
    const {
      timezoneOffset, code, context: dropboxContext, invitationToken, browserLanguageCode,
    } = signInDropbox;
    return this.authService.loginWithDropbox({
      code,
      timezoneOffset,
      context: dropboxContext,
      invitationToken,
      browserLanguageCode,
      ipAddress,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS, RateLimiterStrategy.EMAIL)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation()
  async adminForgotPassword(
    @Args('input') forgotPassword: ForgotPasswordInput,
  ): Promise<BasicResponse> {
    const { email } = forgotPassword;
    await this.authService.adminForgotPassword(email);
    return {
      message: 'Password-reset email has been sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Query()
  async checkResetPasswordUrl(@Args('input') input: CheckResetPasswordInput): Promise<BasicResponse> {
    try {
      const tokenData: { email: string } = this.jwtService.verify(input.token, {
        ignoreExpiration: false,
      });
      const resetPasswordToken = await this.redisService.getResetPasswordToken(tokenData.email);
      if (input.token !== resetPasswordToken) {
        throw GraphErrorException.BadRequest('Token is invalid', ErrorCode.Common.TOKEN_INVALID);
      }
      return {
        message: 'Token is valid',
        statusCode: 200,
      };
    } catch (error) {
      throw GraphErrorException.BadRequest('Token is invalid', ErrorCode.Common.TOKEN_INVALID);
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseGuards(GqlAttachUserGuard)
  @Query()
  async inviteOrgVerification(@Args('token') token: string, @Context() context): Promise<InviteOrgVerificationPayload> {
    const { user: userContext } = context.req;
    const { email, orgId, error } = await this.authService.verifyOrgInvitationToken(token);

    if (error) {
      return {
        isLuminUser: false,
        email: '',
        orgUrl: '',
        orgName: '',
        isValidToken: false,
        notFinishedAuthenFlow: false,
      };
    }

    const data = await this.organizationService.getOrgById(orgId);

    if (userContext && email !== userContext.email) {
      return {
        isLuminUser: true,
        email,
        orgUrl: data?.url,
        orgName: data?.name,
        isValidToken: false,
        notFinishedAuthenFlow: false,
      };
    }
    let notFinishedAuthenFlow = false;
    const user = await this.userService.updateUnverifiedUserProperty({
      email,
    }, { isVerified: true });

    if (user) {
      const orgMemberships = await this.organizationService.getMembersByUserId(user._id);
      const [requestAccess] = await this.organizationService.getRequestAccessByCondition({
        actor: email,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
        target: orgId,
      });
      const [noti] = await this.notificationService.getNotificationsByConditions({
        actionType: NotiOrg.INVITE_JOIN,
        'entity.entityId': orgId,
        'target.targetData.invitationList._id': requestAccess?._id,
      });
      // eslint-disable-next-line no-restricted-globals
      const isFirstLogin = isNaN(user.timezoneOffset);
      const orgIds = await this.organizationService.addUserToOrgsWithInvitation(user, orgId);
      if (!orgMemberships.length && (isFirstLogin || noti)) {
        await this.documentService.createNonLuminUserDocumentPermission({
          user,
          orgIds,
          teamIds: [],
        });
        notFinishedAuthenFlow = true;
        if (requestAccess) {
          await this.userService.createDefaultOrgOnFreeUser(user);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const organization = await this.organizationService.findOneOrganization({ ownerId: user._id });
        if (user.payment.type === PaymentPlanEnums.FREE && !organization && requestAccess) {
          await this.organizationService.createCustomOrganization(user);
        }
      }
    }
    const isLuminUser = Boolean(user);

    const [inviteOrgData, findMemberInOrg] = await Promise.all([
      this.organizationService.getInviteOrgList({ target: orgId, actor: email }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.organizationService.getMembershipByOrgAndUser(orgId, user?._id),
    ]);
    const isValidToken = Boolean(data) && Boolean(inviteOrgData.length || findMemberInOrg);

    return {
      isLuminUser,
      email,
      orgUrl: data?.url,
      orgName: data?.name,
      isValidToken,
      notFinishedAuthenFlow,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation()
  async resetPassword(
    @Args('input') resetPassword: ResetPasswordInput,
  ): Promise<BasicResponse> {
    const error = await this.authService.changePassword(resetPassword);
    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GraphErrorException.ApplicationError(error);
    }
    return {
      message: 'Reset password successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation()
  async adminResetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<BasicResponse> {
    await this.authService.adminResetPassword(input);
    return {
      message: 'Reset password successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation()
  async adminCreatePassword(
    @Args('input') input: AdminCreatePasswordInput,
  ): Promise<AdminPayload> {
    const updatedAdmin = await this.authService.adminCreatePassword(input);
    return {
      admin: updatedAdmin,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  signOut(@Context() context, @Args('input') input: SignOutInput): BasicResponse {
    const { token, refreshToken, type } = input;
    const { user } = context.req;

    const result = this.authService.signOut(user._id as string, token, refreshToken, type);
    if (result) {
      return {
        message: 'Sign out successfully',
        statusCode: HttpStatus.OK,
      };
    }
    throw GraphErrorException.InternalServerError('Failed to sign out', ErrorCode.User.SIGN_OUT_FAIL);
  }

  @UseGuards(AdminAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async adminSignOut(@Context() context): Promise<BasicResponse> {
    const { headers, user: { _id: adminId } } = context.req;
    const authHeader = headers[CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER];
    const { value: token } = Utils.parseAuthHeader(authHeader);
    await this.authService.adminSignOut(adminId as string, token);
    return {
      message: 'Sign out successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async forceLogout(@Args('stayLoggedIn') stayLoggedIn: boolean, @Context() context): Promise<BasicResponse> {
    const id = context.req.user._id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(id);
    if (!user) {
      return {
        message: 'User not found',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    if (!stayLoggedIn) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.redisService.clearAllRefreshToken(id);
      return {
        message: 'Force logout successfully',
        statusCode: HttpStatus.OK,
      };
    }
    return {
      message: 'Stay Logged In',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(CustomRulesInterceptor)
  @Query()
  async verifyToken(
    @Args('input') input: VerifyTokenInput,
    @Context() context,
  ): Promise<VerifyTokenPayload> {
    const { user: payload } = context.req;
    const { timezoneOffset } = input || {};
    const ipAddress = Utils.getIpRequest(context.req);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(payload._id);
    if (!user) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const isMigratedPersonalDoc = user.metadata?.isMigratedPersonalDoc;
    const hasInformedMyDocumentUpload = user.metadata?.hasInformedMyDocumentUpload;
    const metadata = {
      ...user.metadata,
      isMigratedPersonalDoc: isMigratedPersonalDoc ?? false,
      hasInformedMyDocumentUpload: hasInformedMyDocumentUpload ?? true,
    };
    const updatedUser = await this.userService.updateUserPropertyById(user._id, {
      lastAccess: new Date(),
      metadata,
    });
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(updatedUser.timezoneOffset) && timezoneOffset) {
      await this.userService.updateUserPropertyById(updatedUser._id, { timezoneOffset });
    }
    await Promise.all([
      this.userService.migratePersonalWorkspace(updatedUser),
      this.userService.handleInvitationsAfterFirstLogin(updatedUser),
    ]);
    const respUser = await this.userService.interceptUserData({ user: updatedUser, loginService: user.loginService });
    // Attach sign up user to handle some custom logic in custom.rules.interceptors.ts
    context.req.user = respUser;
    respUser.isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(respUser as User);
    const { token, error: authTokenError } = this.authService.getAuthToken({ data: respUser, isGraphqlRequest: true, ipAddress });
    if (authTokenError) {
      throw authTokenError;
    }
    return {
      token,
      user: respUser,
    };
  }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async signUp(@Args('input') signUpUser: SignUpInput): Promise<SignUpPayload> {
    const { signUpData, error } = this.authService.destructSignUpInput(signUpUser);
    if (error) {
      throw GraphErrorException.ApplicationError(error);
    }
    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, signUpData.email);
    if (existedBlacklist) {
      throw GraphErrorException.NotAcceptable('This email is banned', ErrorCode.User.EMAIL_IS_BANNED);
    }
    const verifyPasswordStrength = this.authService.verifyUserPasswordStrength(signUpData.email, signUpData.password);
    if (!verifyPasswordStrength.isVerified) {
      throw verifyPasswordStrength.error;
    }
    if (signUpUser.sharingToken) {
      const tokenData = this.jwtService.verify(signUpUser.sharingToken);
      const { email }: { email: string } = tokenData;
      if (!(email && Utils.validateEmail(email))) {
        throw GraphErrorException.BadRequest('Invalid Email', ErrorCode.User.INVALID_EMAIL);
      }
      signUpData.email = email;
    }
    const { user, error: signUpError } = await this.authService.signUp(signUpData);
    if (signUpError) {
      throw GraphErrorException.ApplicationError(signUpError);
    }
    return {
      message: 'We have sent you an email to verify your email address. Please check your email!',
      statusCode: HttpStatus.OK,
      userId: user._id,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.INGRESS_COOKIE)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseInterceptors(LoggingInterceptor)
  @Query()
  async signIn(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('timezoneOffset') timezoneOffset: number,
    @Args('browserLanguageCode') browserLanguageCode: string,
  ): Promise<SignInPayload> {
    const { data, error } = await this.authService.signIn({
      userEmail: email, password, timezoneOffset, browserLanguageCode,
    });
    if (error) {
      throw GraphErrorException.ApplicationError(error);
    }
    const {
      token, refreshToken, user,
    } = data;

    return {
      token,
      refreshToken,
      user: {
        ...user,
        isUsingPassword: true,
      },
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(CustomRulesInterceptor)
  @Query()
  async getMe(
    @Args('timezoneOffset') timezoneOffset: number,
    @Args('invitationToken') invitationToken: string,
    @Args('skipOnboardingFlow') skipOnboardingFlow: boolean,
    @Context() context,
  ): Promise<VerifyTokenPayload> {
    const { user: { _id } } = context.req;
    const hashedIpAddress = Utils.getHashedIpRequest(context.req);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(_id);
    if (!user) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const trackingContext = Utils.getTrackingContext(context.req);
    await this.userService.firstSignInFromSignUpInvitation(user, invitationToken, trackingContext).catch((error) => {
      this.loggerService.debug('Failed to handle non lumin user invitation', {
        extraInfo: {
          userId: user._id,
          error,
        },
      });
    });
    if (skipOnboardingFlow) {
      await this.organizationService.createFirstOrgOnFreeUser(user);
    }
    // auto add member to org if same unpopular domain with inviter
    await this.organizationService.addUserToOrgsWithSameDomain(user).catch((error) => {
      this.loggerService.error({
        error,
        context: this.organizationService.addUserToOrgsWithSameDomain.name,
      });
    });
    const promises = [];
    const isPremiumUser = (user.payment.type as PaymentPlanEnums) !== PaymentPlanEnums.FREE;
    if (user.metadata.beRemovedFromDeletedOrg && !invitationToken && !skipOnboardingFlow && !isPremiumUser) {
      promises.push(
        this.organizationService.getOrgListByUser(user._id, {
          filterQuery: {
            $or: [
              { deletedAt: { $exists: false } },
              { deletedAt: { $eq: null } },
            ],
          },
        }),
      );
    }
    const userDataAfterAccessingApp: { timezoneOffset: number; hasSyncedEmailToBraze?: boolean } = { timezoneOffset };
    const [userInActiveOrgs] = await Promise.all(promises) as [IOrganization[]];
    await Promise.all([
      this.userService.migratePersonalWorkspace(user),
      this.userService.handleInvitationsAfterFirstLogin(user),
      // Pause syncing for this: https://lumin.atlassian.net/browse/LP-11558
      // this.brazeService.syncUserEmail(user).then((resp) => {
      //   if (resp?.hasSynced) {
      //     userDataAfterAccessingApp.hasSyncedEmailToBraze = true;
      //   }
      // }),
    ]);
    const shouldCreateNewOrg = userInActiveOrgs?.length === 0;
    this.brazeService.trackMarketingEmailAttributes(user);
    const updatedUserData = await this.userService.updateUserDataAfterAccessingApp(user, userDataAfterAccessingApp);
    const [respUser, organization, formFieldDetectionUsage, autoDetectionUsage] = await Promise.all([
      this.userService.interceptUserData({ user: updatedUserData, loginService: user.loginService }),
      shouldCreateNewOrg && this.organizationService.createCustomOrganization(updatedUserData),
      this.authService.getFormFieldDetectionUsage(user._id),
      this.authService.getAutoDetectionUsage(user._id),
    ]);
    if (organization) {
      this.userService.updateLastAccessedOrg(respUser._id, organization._id);
      respUser.lastAccessedOrgUrl = organization.url;
    }
    respUser.hashedIpAddress = hashedIpAddress;
    respUser.isOneDriveAddInsWhitelisted = this.userService.checkOneDriveAddInsWhitelisted(respUser.email);
    respUser.isOneDriveFilePickerWhitelisted = this.userService.checkOneDriveFilePickerWhitelisted(respUser.email);
    respUser.isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(user);
    respUser.toolQuota = {
      ...(formFieldDetectionUsage ? { formFieldDetection: formFieldDetectionUsage } : {}),
      ...(autoDetectionUsage ? { autoDetection: autoDetectionUsage } : {}),
    };

    const allTenantConfigurations = this.customRuleLoader.getAllTenantConfigurations();
    respUser.allTenantConfigurations = Object.entries(allTenantConfigurations).map(([domain, configuration]) => ({
      domain,
      configuration,
    }));

    return {
      user: respUser,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(AdminAuthGuard)
  @Query()
  async adminVerifyToken(
    @Context() context,
  ): Promise<AdminVerifyTokenPayload> {
    const { user: { _id: adminId } } = context.req;
    const admin = await this.adminService.findById(adminId as string);
    if (!admin) {
      throw GraphErrorException.NotFound('Admin not found', ErrorCode.Admin.ADMIN_NOT_FOUND);
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
    const token = this.authService.getAccessToken({
      ...resAdmin,
      userType: APP_USER_TYPE.SALE_ADMIN,
    });
    return {
      token,
      user: resAdmin,
    };
  }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(GqlAuthGuard)
  @Query()
  async verifyPassword(
    @Args('password') password: string,
    @Context() context,
  ): Promise<VerifyPasswordPayload> {
    const { user: payload } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(payload._id);
    if (!user) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    if (user.password) {
      const isMatch = await user.comparePassword(password);
      return {
        verified: isMatch,
      };
    }
    return {
      verified: true,
    };
  }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(GqlAuthGuard)
  @Query()
  async checkLoginExternal(
    @Context() context,
  ): Promise<CheckLoginExternalPayload> {
    const { user: payload } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(payload._id);
    if (!user) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    if (user.password) {
      return {
        external: false,
      };
    }
    return {
      external: true,
    };
  }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query()
  getLandingPageToken(
    @Args('landingPageType') landingPageType: string,
  ): GetLandingPageTokenPayload {
    const landingPageToken = this.authService.genLandingPageToken(landingPageType);
    this.redisService.setRedisData(landingPageToken, '1');
    this.redisService.setExpireKey(landingPageToken, 300);
    return {
      landingPageToken,
    };
  }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async updateUserType(
    @Args('landingPageToken') landingPageToken: string,
    @Context() context,
  ): Promise<UpdateUserTypePayload> {
    const { user } = context.req;
    const isExistToken = await this.redisService.getRedisValueWithKey(landingPageToken);
    if (isExistToken) {
      const { landingPageType } = this.jwtService.verify(landingPageToken);
      if (landingPageType && Object.values(USER_TYPE).includes(landingPageType as string)) {
        const updatedUser = await this.userService.updateUserProperty({ _id: user._id }, { type: landingPageType });
        return {
          type: updatedUser.type,
          statusCode: HttpStatus.OK,
          message: 'Update user type successfully',
        };
      }
    }
    return {
      type: null,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Update user type failed',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Query()
  async verifySharingDocumentToken(
    @Args('sharingToken') sharingToken: string,
  ): Promise<VerifySharingDocPayload> {
    try {
      // decode token (email, documentId)
      // if token not exist -> throw exception
      const { metadata, email } = this.jwtService.verify<IUserInvitationToken>(sharingToken);

      if (!metadata.documentId || !email) {
        throw GraphErrorException.Forbidden('Token is invalid', ErrorCode.Common.TOKEN_INVALID);
      }

      // check this user is existed on system
      const [user, document] = await Promise.all([
        this.userService.findUserByEmail(email),
        this.documentService.getDocumentByDocumentId(metadata.documentId),
      ]);

      const payload = {
        email,
        documentId: metadata.documentId,
        documentName: document?.name,
        linkType: document?.shareSetting?.linkType || '',
        isSignedUp: Boolean(user),
      };

      return payload;
    } catch (e) {
      throw GraphErrorException.Forbidden('Token is invalid', ErrorCode.Common.TOKEN_INVALID);
    }
  }

  // will be deprecated after release implicit flow 1-2 weeks
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  @UseGuards(GqlAuthGuard)
  async exchangeGoogleToken(
    @Args('code') authorizationCode: string,
    @Context() context,
  ): Promise<ExchangeGoogleTokenPayload> {
    const { user, headers } = context.req;
    const redirectUri = headers.origin === TESTING_URL ? TESTING_URL : this.environmentService.getByKey(EnvConstants.BASE_URL);
    const oauth2Client = new OAuth2Client({
      clientId: this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID),
      clientSecret: this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_SECRET),
      redirectUri,
    });
    const { tokens } = await oauth2Client.getToken(authorizationCode);
    await this.userService.updateUserProperty({ _id: user._id }, { googleRefreshToken: tokens.refresh_token });

    return {
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      scope: tokens.scope,
    };
  }

  /* Temporary solution for both authentication and authorization in same flow */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(CustomRulesInterceptor, LoggingInterceptor, SanitizeInputInterceptor)
  @Mutation()
  async signInByGoogleV2(
    @Args('input') signInByGoogle: SignInByGoogleInputV2,
    @Context() resolverCtx,
  ): Promise<SignInThirdPartyPayloadV2> {
    const ipAddress = Utils.getIpRequest(resolverCtx.req);
    const {
      code, accessToken, timezoneOffset, context, browserLanguageCode,
    } = signInByGoogle;
    const redirectUri = resolverCtx.req.headers.origin === TESTING_URL ? TESTING_URL : this.environmentService.getByKey(EnvConstants.BASE_URL);
    const oauth2Client = new OAuth2Client({
      clientId: this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID),
      clientSecret: this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_SECRET),
      redirectUri,
    });

    // will be deprecated
    // remove this block after release implicit 1-2 week(s)
    if (code) {
      const { tokens } = await oauth2Client.getToken(code);
      const payload = await this.authService.loginWithGoogle({
        idToken: tokens.id_token, platform: '', timezoneOffset, context, browserLanguageCode, ipAddress,
      });
      await this.userService.updateUserProperty({ _id: payload.user._id }, { googleRefreshToken: tokens.refresh_token });
      return {
        ...payload,
        oauth2Token: tokens.access_token,
        idToken: tokens.id_token,
        scope: tokens.scope,
      };
    }

    const startTime = process.hrtime();
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    this.loggerService.info({
      context: 'signInByGoogleV2-getTokenInfo',
      extraInfo: {
        execTime: Utils.convertToMs(process.hrtime(startTime)),
      },
    });
    if (!tokenInfo) {
      throw GraphErrorException.BadRequest('Invalid access token');
    }
    const payload = await this.authService.loginWithGoogleV2({
      googleEmail: tokenInfo.email, timezoneOffset, browserLanguageCode, ipAddress,
    });
    if (!payload.isSignedUp) {
      resolverCtx.req.signUpUser = payload.user;
    } else {
      resolverCtx.req.user = payload.user;
    }
    return {
      ...payload,
      scope: tokenInfo.scopes.join(' '),
    };
  }

  // will be deprecated after release implicit flow 1-2 weeks
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  @UseGuards(GqlAuthGuard)
  async getGoogleAccessToken(
    @Context() context,
  ): Promise<GoogleToken> {
    const { user, headers } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userData = await this.userService.findUserById(user._id);
    const redirectUri = headers.origin === TESTING_URL ? TESTING_URL : this.environmentService.getByKey(EnvConstants.BASE_URL);
    const oauth2Client = new OAuth2Client({
      clientId: this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID),
      clientSecret: this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_SECRET),
      redirectUri,
    });
    if (!userData.googleRefreshToken) {
      throw GraphErrorException.BadRequest('Cannot get new access token', ErrorCode.Common.GOOGLE_TOKEN_EXPIRED);
    }
    oauth2Client.setCredentials({
      refresh_token: userData.googleRefreshToken,
    });
    try {
      const { token } = await oauth2Client.getAccessToken();
      const { scopes } = await oauth2Client.getTokenInfo(token);
      return {
        token,
        scope: scopes.join(' '),
      };
    } catch (e) {
      throw GraphErrorException.Forbidden('Token expired', ErrorCode.Common.GOOGLE_TOKEN_EXPIRED);
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Query()
  async signinWithLumin(
    @Args('code') authorizationCode: string,
    @Args('redirectUri') redirectUri: string,
    @Args('timezoneOffset') timezoneOffset: number,
    @Args('codeVerifier') codeVerifier: string,
  ): Promise<SigninWithLuminPayload> {
    const data = await this.authService.signinWithLumin({
      code: authorizationCode, customRedirectUri: redirectUri, timezoneOffset, codeVerifier,
    });
    return {
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
      idToken: data.idToken,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseGuards(GqlAuthGuard)
  @Query()
  async verifyNewUserInvitationToken(
    @Context() context,
    @Args('token') token: string,
  ): Promise<VerifyInvitationTokenPayload> {
    const { user } = context.req;
    const {
      data, status,
    } = await this.authService.verifyNewUserInvitationToken(token);
    if (!data) {
      throw GraphErrorException.Forbidden('You have no permission');
    }

    const orgMemberships = await this.organizationService.getMembersByUserId(user._id as string);
    return {
      ...data,
      status,
      newAuthProcessing: !orgMemberships.length,
    };
  }

  @Query()
  healthCheck(): BasicResponse {
    return {
      message: 'OK',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(CustomRulesInterceptor)
  @Query()
  async validateIPWhitelist(
    @Context() context,
    @Args('email') email: string,
  ): Promise<BasicResponse> {
    const ipAddress = Utils.getIpRequest(context.req);
    const { error } = this.whitelistIpService.validateIPRequest({ isGraphqlRequest: true, email, ipAddress });
    if (error) {
      throw error;
    }
    const user = await this.userService.findUserByEmail(email);
    context.req.user = user || { email };

    return {
      message: 'OK',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Query()
  getCredentialsFromOpenGoogle(
    @Args('credentialId') credentialId: string,
    @Context() context,
  ): Promise<CredentialsFromOpenGooglePayload> {
    const ipAddress = Utils.getIpRequest(context.req);
    return this.authService.getCredentialsFromOpenGoogle(credentialId, ipAddress);
  }
}
