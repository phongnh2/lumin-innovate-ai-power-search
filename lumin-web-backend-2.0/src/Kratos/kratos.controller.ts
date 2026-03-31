import { Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Session } from '@ory/client';
import { Types } from 'mongoose';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_TYPE } from 'Common/constants/EmailConstant';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { Platforms } from 'Common/constants/Platform';
import { SOCKET_MESSAGE, SOCKET_NAMESPACE } from 'Common/constants/SocketConstants';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { KratosRegistrationCallbackDto } from 'Auth/dto/auth.dto';
import { IVerifyUserInvitationResult } from 'Auth/interfaces/auth.interface';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { DocumentService } from 'Document/document.service';
import { EmailService } from 'Email/email.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { TeamAndOrganizationOwnerPayload, LoginService } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { LuminContractService } from 'LuminContract/luminContract.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { TeamService } from 'Team/team.service';
import { User, UserWithExtraInfo } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { KratosService } from './kratos.service';

@Controller('kratos')
export class KratosController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly blacklistService: BlacklistService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationService,
    private readonly messageGateway: EventsGateway,
    private readonly redisService: RedisService,
    private readonly kratosService: KratosService,
    private readonly emailService: EmailService,
    private readonly luminContractService: LuminContractService,
    private readonly loggerService: LoggerService,
    private readonly documentService: DocumentService,
  ) {}

  @GrpcMethod('UserService', 'UpdateProfileAvatar')
  updateProfileAvatar(data): void {
    const { avatarRemoteId, identityId } = data;
    this.userService.updateUserByIdentityId(identityId as string, { avatarRemoteId });
  }

  @GrpcMethod('UserService', 'RemoveProfileAvatar')
  removeProfileAvatar(data): void {
    const { identityId } = data;
    this.userService.findOneAndUpdate({ identityId }, { $unset: { avatarRemoteId: 1 } });
  }

  @GrpcMethod('KratosService', 'VerifyNewUserInvitationToken')
  async verifyNewUserInvitationToken(params: { token: string }): Promise<IVerifyUserInvitationResult> {
    const { token } = params;
    const {
      error, data, isSignedUp, status,
    } = await this.authService.verifyNewUserInvitationToken(token);
    return {
      data,
      status,
      isSignedUp,
      error,
    };
  }

  @GrpcMethod('KratosService', 'VerifyFirstSignInWithOry')
  async verifyFirstSignInWithOry(data: { email: string }): Promise<{
    error?: { code: string, message: string, metadata?: { loginService: LoginService | 'unknown_third_party' } }, isAccept: boolean,
  }> {
    const { email } = data;
    const existedUser = await this.userService.findUserByEmail(email);
    if (!existedUser) {
      return { isAccept: true };
    }
    if (existedUser.identityId) {
      return { isAccept: true };
    }
    if (existedUser.password) {
      return {
        error: {
          code: ErrorCode.User.PASSWORD_EXPIRED,
          message: 'Password was expired',
        },
        isAccept: false,
      };
    }
    const loginService = this.authService.getUserLoginServiceForKratosActions(existedUser);
    return {
      error: {
        code: ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
        message: ErrorMessage.USER.ALREADY_SIGNED_IN_ANOTHER_METHOD,
        metadata: {
          loginService,
        },
      },
      isAccept: false,
    };
  }

  @GrpcMethod('KratosService', 'VerifyRegisterAccount')
  async verifyRegisterAccount(data): Promise<{
    error?:{
      code: string,
      message: string
    },
    isAccept: boolean,
  }> {
    const { email } = data;
    const blacklistAccount = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email as string);
    if (blacklistAccount) {
      return {
        error: {
          code: ErrorCode.User.EMAIL_IS_BANNED,
          message: 'This email is banned',
        },
        isAccept: false,
      };
    }
    return {
      isAccept: true,
    };
  }

  @GrpcMethod('KratosService', 'KratosRegistrationFlow')
  async handleKratosRegistrationFlowCallback(data: KratosRegistrationCallbackDto): Promise<{ statusCode: number }> {
    const { isVerified, traits, id: identityId } = data.identity;
    const {
      email,
      name,
      loginService,
      sub,
    } = traits;

    await this.authService.handleKratosRegistrationFlowCallback({
      identityId,
      email,
      name,
      ...(loginService === LoginService.APPLE && { appleUserId: sub }),
      isVerified,
      loginType: loginService,
    });

    return {
      statusCode: HttpStatus.OK,
    };
  }

  @GrpcMethod('KratosService', 'KratosVerificationFlow')
  async handleKratosVerificationFlowCallback(data: KratosRegistrationCallbackDto): Promise<{ statusCode: number }> {
    const { id } = data.identity;
    const user = await this.userService.updateUserByIdentityId(id, {
      isVerified: true,
    });

    this.emailService
      .sendEmail(
        EMAIL_TYPE.WELCOME,
        [user.email],
        {
          name: user.name,
          mobileDeeplinkUrl: this.emailService.generateDeeplinkForEmail('/email-welcome'),
        },
        user.origin,
      );

    return {
      statusCode: HttpStatus.OK,
    };
  }

  @GrpcMethod('KratosService', 'KratosSyncUpSettingsData')
  async handleKratosSyncUpSettingsDataCallback(data: KratosRegistrationCallbackDto): Promise<{ statusCode: number }> {
    const { id, isVerified } = data.identity;
    const {
      email, name, avatarRemoteId, loginService,
    } = data.identity.traits;

    const foundUser = await this.userService.findUserByIdentityId(id, {
      _id: 1,
      email: 1,
      identityId: 1,
      loginService: 1,
      isVerified: 1,
    });

    if (!foundUser) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    if (foundUser.email !== email) {
      await this.authService.changeEmailOnKratos({ user: foundUser, newEmail: foundUser.email, markAsVerified: foundUser.isVerified });
      return {
        statusCode: HttpStatus.OK,
      };
    }

    await this.userService.updateUserByIdentityId(id, {
      name,
      avatarRemoteId,
      isVerified,
      loginService,
    });

    return {
      statusCode: HttpStatus.OK,
    };
  }

  @GrpcMethod('UserService', 'GetCurrentUser')
  async getCurrentUser(params: { identityId: string }): Promise<Partial<UserWithExtraInfo>> {
    const { identityId } = params;
    const user = ((await this.userService.findUserByIdentityId(identityId, {
      _id: 1,
      deletedAt: 1,
      avatarRemoteId: 1,
      name: 1,
      email: 1,
      metadata: 1,
    })) || {}) as User;

    if (!user.email) {
      this.loggerService.debug('User not found by identityId', {
        context: 'KratosController.getCurrentUser',
        extraInfo: { identityId },
      });
    }

    return {
      ...user,
      isTermsOfUseVersionChanged: user.metadata ? this.userService.checkTermsOfUseVersionChanged(user) : false,
      isPopularDomain: user.email ? Utils.verifyDomain(user.email) : false,
    };
  }

  @GrpcMethod('UserService', 'DeleteAccount')
  async deleteAccount(params: { identityId: string }): Promise<{
    user?: Partial<User>,
    error?: { errorCode: string, message: string }
  }> {
    const { identityId } = params;
    const { _id: userId } = await this.userService.findUserByIdentityId(identityId, { _id: 1 }) || {};
    if (!userId) {
      return {
        error: {
          errorCode: ErrorCode.User.USER_NOT_FOUND,
          message: ErrorMessage.USER.USER_NOT_FOUND,
        },
      };
    }
    const { error, user } = await this.authService.deleteAccount({ userId });
    if (error) {
      return {
        error: {
          errorCode: error.errorCode,
          message: error.message,
        },
      };
    }
    try {
      await this.luminContractService.deleteAccount({
        userId,
      });
    } catch (_error) {
      this.loggerService.error({
        context: 'luminContractService.deleteAccount',
        extraInfo: {
          userId,
          identityId,
        },
        error: _error,
      });
    }
    try {
      await this.documentService.deleteManyRequestAccess({ requesterId: userId });
    } catch (_error) {
      this.loggerService.error({
        context: 'deleteAccount - documentService.deleteManyRequestAccess',
        extraInfo: {
          userId,
          identityId,
        },
        error: _error,
      });
    }
    return {
      user: {
        deletedAt: user.deletedAt,
        // Pass userId to lumin-sign can be delete related data
        _id: user._id,
      },
    };
  }

  @GrpcMethod('UserService', 'ReactivateAccount')
  async reactivateAccount(params: { identityId: string }): Promise<Partial<User>> {
    const { identityId } = params;
    const { _id: userId } = await this.userService.findUserByIdentityId(identityId, { _id: 1 });
    const reactivatedUser = await this.userService.reactivateUser(userId);
    return reactivatedUser;
  }

  @GrpcMethod('UserService', 'GetTeamAndOrganizationOwner')
  async getTeamAndOrganizationOwner(params: { identityId: string }): Promise<
    TeamAndOrganizationOwnerPayload | { error?: { errorCode: string, message: string } }
  > {
    const { identityId } = params;
    const { _id: userId } = await this.userService.findUserByIdentityId(identityId, { _id: 1 }) || {};
    if (!userId) {
      return {
        error: {
          errorCode: ErrorCode.User.USER_NOT_FOUND,
          message: ErrorMessage.USER.USER_NOT_FOUND,
        },
      };
    }
    const [teamOwner, organizationOwner] = await Promise.all([
      this.teamService.aggregate([
        { $match: { ownerId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'organizations',
            localField: 'belongsTo',
            foreignField: '_id',
            as: 'belongsTo',
          },
        },
        {
          $unwind: '$belongsTo',
        },
      ]),
      this.organizationService.getOrganizationOwner(userId),
    ]);
    return {
      organizationOwner,
      teamOwner,
    };
  }

  @GrpcMethod('KratosService', 'SignOut')
  handleKratosSignOut({ id: sessionId }: { id: string }): void {
    this.messageGateway.server.emit(SOCKET_MESSAGE.AG_LOGOUT_NOTIFY, { sessionId });
    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${sessionId}`)
      .emit(SOCKET_MESSAGE.USER_LOGOUT);
  }

  @GrpcMethod('UserService', 'GetUserByEmail')
  async getUserByEmail({ email }: { email: string }):
    Promise<{ user?: UserWithExtraInfo, error?: { errorCode: string, message: string, metadata?: { loginService: LoginService }}}> {
    const userData = await this.userService.findUserByEmail(email);
    if (!userData) {
      return {
        error: {
          errorCode: ErrorCode.User.USER_NOT_FOUND,
          message: ErrorMessage.USER.USER_NOT_FOUND,
        },
      };
    }
    const loginService = this.authService.getUserLoginServiceForKratosActions(userData);
    return {
      user: Object.assign(userData, { loginService, isTermsOfUseVersionChanged: this.userService.checkTermsOfUseVersionChanged(userData) }),
    };
  }

  @GrpcMethod('KratosService', 'ForceLogout')
  async handleKratosForceLogout({ id: identityId }: { id: string }): Promise<void> {
    const user = await this.userService.findUserByIdentityId(identityId);
    if (!user) {
      this.loggerService.warn({
        context: this.handleKratosForceLogout.name,
        message: '[ForceLogout] User not found',
        extraInfo: { identityId },
      });
      return;
    }

    // revoke all Kratos sessions for this identity
    await this.kratosService.revokeAllSessionsForIdentity(identityId);

    this.redisService.clearAllRefreshToken(user._id);
    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${user._id}`)
      .emit(SOCKET_MESSAGE.USER_LOGOUT);
  }

  @GrpcMethod('KratosService', 'GetSession')
  async handleKratosGetSession({ token }: { token: string }): Promise<Partial<Session>> {
    try {
      return await this.authService.getSession(token);
    } catch {
      throw GrpcErrorException.InvalidArgument('Invalid session', ErrorCode.GrpcService.INVALID_SESSION);
    }
  }

  @GrpcMethod('UserService', 'VerifyRecaptcha')
  async verifyRecaptchaAuth({ responseKey, action }: { responseKey: string, action: string }): Promise<any> {
    const { success } = await this.authService.verifyRecaptchaAuth({ responseKey, expectedAction: action });
    if (!success) {
      return {
        error: {
          errorCode: ErrorCode.Common.RECAPTCHA_V2_VALIDATION_FAILED,
          message: 'Verify recaptcha failed. Please try again.',
        },
      };
    }
    return { isSuccess: success };
  }

  @GrpcMethod('AuthService', 'CheckAttempResendVerification')
  async checkAttempResendVerification(data): Promise<{
    isAccept?: boolean,
    error?: {
      message: string;
      code: string;
      metadata?: {
        remainingTime: number;
      }
    }
  }> {
    const { email } = data;
    const { error, isAccept } = await this.authService.validateResendVerificationMail(email as string);
    if (error && !isAccept) {
      return { error, isAccept };
    }
    return { isAccept: true };
  }

  @GrpcMethod('AuthService', 'SetAttempResendVerification')
  async setAttempResendVerification(data): Promise<{
    isAccept: boolean,
    error?: {
      message: string;
      code: string;
      metadata?: {
        remainingTime: number;
      }
    }
  }> {
    const { email } = data;
    const { error, isAccept } = await this.authService.validateResendVerificationMail(email as string);
    if (error && !isAccept) {
      return { error, isAccept };
    }
    this.redisService.setTempKeyPreventSpamVerifyEmail(email as string);
    return { isAccept: true };
  }

  @GrpcMethod('AuthService', 'UpdateUserPropertiesByIdentityId')
  async updateUserPropertiesByIdentityId(data): Promise<User> {
    const { identityId, properties } = data;
    if (!identityId) {
      throw GrpcErrorException.InvalidArgument('identityId is missing', ErrorCode.Common.INVALID_INPUT);
    }
    const user = await this.userService.updateUserByIdentityId(identityId as string, properties);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    return user;
  }

  @GrpcMethod('UserService', 'UpdateUserProperties')
  async updateUserProperties(data): Promise<void> {
    const { identityId, email } = data as { identityId: string; email: string };
    const user = await this.userService.findUserByEmail(email);
    if (!user.identityId) {
      const validated = await this.kratosService.validateIdentity(identityId, email);
      if (!validated) {
        return;
      }
      await this.userService.updateUserPropertyById(user._id, { identityId, isVerified: true }, true);
    }
  }

  @GrpcMethod('KratosService', 'KratosRegistrationFlowV2')
  async handleKratosRegistrationFlowCallbackV2(data: KratosRegistrationCallbackDto): Promise<{ isAccept: boolean; error?: any }> {
    const { isVerified, traits, id: identityId } = data.identity;
    const {
      email,
      name,
      loginService,
      sub,
    } = traits;
    const { platform, userAgent, anonymousUserId } = data.transientPayload || {};

    return this.authService.handleKratosRegistrationFlowCallbackV2({
      identityId,
      email,
      name,
      ...(loginService === LoginService.APPLE && { appleUserId: sub }),
      isVerified,
      loginType: loginService,
      ...(platform && { platform: platform as Platforms }),
      ...(userAgent && { userAgent: userAgent as string }),
      ...(anonymousUserId && { anonymousUserId: anonymousUserId as string }),
    });
  }

  @GrpcMethod('KratosService', 'AfterSignUpInvitation')
  afterSignUpInvitation(data: { email: string; token: string }): void {
    this.redisService.setRedisDataWithExpireTime({
      key: `${RedisConstants.USER_SIGN_UP_BY_INVITATION}${data.email}`,
      value: data.token,
      expireTime: CommonConstants.USER_SIGN_UP_BY_INVITATION_EXPIRE_IN,
    });
  }

  @GrpcMethod('KratosService', 'LinkSamlLoginService')
  async linkSamlLoginService(data: { identityId: string }): Promise<void> {
    return this.authService.linkSamlLoginService(data);
  }
}
