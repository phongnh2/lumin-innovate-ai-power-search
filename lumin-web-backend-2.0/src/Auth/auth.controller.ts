import { Metadata } from '@grpc/grpc-js';
import {
  Body,
  Controller, Post, UseGuards, UseInterceptors, UsePipes, Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenExpiredError } from 'jsonwebtoken';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GrpcRequestAllowedSerivces } from 'Common/constants/GrpcConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { EmailConstraint } from 'Common/directives/GraphqlDirective/Constraints/EmailConstraint';
import { MongoIdConstraint } from 'Common/directives/GraphqlDirective/Constraints/MongoIdConstraint';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { TOKEN_TYPE } from 'Auth/auth.enum';
import { AuthService } from 'Auth/auth.service';
import { AuthenType, LoginService, SignInPayload } from 'graphql.schema';
import { KratosService } from 'Kratos/kratos.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TeamService } from 'Team/team.service';
import { User, UserWithExtraInfo } from 'User/interfaces/user.interface';
import { UserOrigin } from 'User/user.enum';
import { UserService } from 'User/user.service';

import { RefreshTokenResponse, ContractTemporaryResponse } from '../swagger/schemas';
import { ContractTemporaryDto } from './dto/contractTemporary.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

const UserType = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationService,
    private readonly kratosService: KratosService,
  ) { }

  private validateMongoId(id: string) {
    const mongoIdConstraint = new MongoIdConstraint({ isOptional: false });
    if (!mongoIdConstraint.validate(id)) {
      return false;
    }
    return true;
  }

  private validateEmail(email: string) {
    const emailConstraint = new EmailConstraint();
    if (!emailConstraint.validate(email)) {
      return false;
    }
    return true;
  }

  private getUserType(user: User) {
    return this.userService.isUserUsingPassword(user) ? UserType.INTERNAL : UserType.EXTERNAL;
  }

  @GrpcMethod('AuthService', 'SignUpWithCredentials')
  async signUpWithCredentials(data): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { signUpData, error } = this.authService.destructSignUpInput(data);
    if (error) {
      throw GrpcErrorException.ApplicationError(error);
    }
    const { error: signUpError, user, tokenVerifyAccount } = await this.authService.signUp({
      ...signUpData,
      origin: UserOrigin.BANANASIGN,
    });
    if (signUpError) {
      throw GrpcErrorException.ApplicationError(signUpError);
    }
    return {
      user: { ...user, loginType: UserType.INTERNAL },
      tokenVerifyAccount,
    };
  }

  @GrpcMethod('AuthService', 'SignInWithCredentials')
  async signInWithCredentials(data): Promise<any> {
    const { email, password, timezoneOffset } = data;
    if (!this.validateEmail(email as string)) {
      throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    const { data: response, error } = await this.authService.signIn({
      userEmail: email,
      password,
      timezoneOffset,
    });
    if (error) {
      throw GrpcErrorException.ApplicationError(error);
    }
    return {
      ...response,
      user: {
        ...response.user,
        loginType: UserType.INTERNAL,
      },
    };
  }

  @GrpcMethod('AuthService', 'SignInWithGoogle')
  async signInWithGoogle(data, metadata: Metadata): Promise<any> {
    const { idToken, platform, timezoneOffset } = data;

    const grpcMetadataValues = metadata.get('client-identifier');
    const grpcClientIdentifier = grpcMetadataValues[0] && grpcMetadataValues[0].toString();

    if (!grpcClientIdentifier) {
      throw GrpcErrorException.InvalidArgument('missing gRPC client identifier', ErrorCode.GrpcService.MISSING_CLIENT);
    }

    if (!GrpcRequestAllowedSerivces.includes(grpcClientIdentifier)) {
      throw GrpcErrorException.PermissionDenied('client identifier is not allowed', ErrorCode.GrpcService.INVALID_CLIENT);
    }

    const response = await this.authService.loginWithGoogle({
      idToken,
      platform,
      timezoneOffset,
      grpcClientIdentifier,
      context: AuthenType.NORMAL,
      userOrigin: UserOrigin.BANANASIGN,
    });
    return {
      ...response,
      user: {
        ...response.user,
        loginType: UserType.EXTERNAL,
      },
    };
  }

  @GrpcMethod('AuthService', 'SignInWithDropbox')
  async signInWithDropbox(data): Promise<any> {
    const { code, timezoneOffset } = data;

    const response = await this.authService.loginWithDropbox({
      code,
      timezoneOffset,
      context: AuthenType.NORMAL,
      userOrigin: UserOrigin.BANANASIGN,
    });
    return {
      ...response,
      user: {
        ...response.user,
        loginType: UserType.EXTERNAL,
      },
    };
  }

  @GrpcMethod('AuthService', 'SignInWithApple')
  async signInWithApple(data): Promise<any> {
    const {
      idToken,
      name,
      nonce,
      timezoneOffset,
    } = data as {
      idToken: string,
      nonce: string,
      timezoneOffset: number,
      name: string,
    };

    const response = await this.authService.loginWithApple(
      idToken,
      nonce,
      timezoneOffset,
      name,
      UserOrigin.BANANASIGN,
    );
    return {
      ...response,
      user: {
        ...response.user,
        loginType: UserType.EXTERNAL,
      },
    };
  }

  @GrpcMethod('AuthService')
  async signInUser(req: { userId: string }): Promise<SignInPayload> {
    const { user, refreshToken, token } = await this.authService.signInUser(req.userId);
    return { user, refreshToken, token };
  }

  @GrpcMethod('AuthService')
  async signInUserEmail(req: { email: string }): Promise<SignInPayload> {
    const { user, refreshToken, token } = await this.authService.signInUserEmail(req.email);
    return { user, refreshToken, token };
  }

  @GrpcMethod('AuthService', 'DeleteAccount')
  async deleteAccount(data): Promise<any> {
    const { userId } = data as { userId: string };
    if (!this.validateMongoId(userId)) {
      throw GrpcErrorException.InvalidArgument('userId must be ObjectId', ErrorCode.Common.INVALID_INPUT);
    }
    const { error } = await this.authService.deleteAccount({ userId });
    if (error) {
      throw GrpcErrorException.ApplicationError(error);
    }
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  async forgotPassword(data): Promise<any> {
    const { email } = data;
    if (!this.validateEmail(email as string)) {
      throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const results = await this.authService.forgotPassword({ ...data, origin: UserOrigin.BANANASIGN });
    if (results) {
      const { error } = results;
      if (error) {
        throw GrpcErrorException.ApplicationError(error);
      }
    }
  }

  @GrpcMethod('AuthService', 'ForgotPasswordByEmail')
  async forgotPasswordByEmail(data): Promise<{ token?: string, name?: string }> {
    const { email } = data;
    if (!this.validateEmail(email as string)) {
      throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const results = await this.authService.forgotPassword({ ...data, origin: UserOrigin.BANANASIGN });
    if (results) {
      const { error, data: payload } = results;
      if (error) {
        throw GrpcErrorException.ApplicationError(error);
      }
      if (payload) {
        return { name: payload.name, token: payload.token };
      }
    }

    return { name: '', token: '' };
  }

  @GrpcMethod('AuthService', 'GetUserById')
  async getUserById(data): Promise<UserWithExtraInfo> {
    const { userId } = data as { userId: string };
    if (!this.validateMongoId(userId)) {
      throw GrpcErrorException.InvalidArgument('userId must be ObjectId', ErrorCode.Common.INVALID_INPUT);
    }
    const user = await this.userService.findUserById(userId, {}, true);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    const [team, organizationOwner, lastAccessedOrgUrl] = await Promise.all([
      this.teamService.findTeamByOwner(userId, { belongsTo: { $exists: true } }, { _id: 1 }),
      this.organizationService.getOrganizationOwner(userId, { _id: 1 }),
      this.userService.getLastAccessedOrg(userId),
    ]);
    return {
      ...user,
      name: user.name || user.email,
      /**
       * @deprecated
       * We can use `loginService`
       */
      loginType: this.getUserType(user),
      loginService: this.userService.isUserUsingPassword(user) ? LoginService.EMAIL_PASSWORD : user.loginService,
      isAdmin: team.length > 0 || organizationOwner.length > 0,
      lastAccessedOrgUrl,
      isTermsOfUseVersionChanged: this.userService.checkTermsOfUseVersionChanged(user),
    };
  }

  @GrpcMethod('AuthService', 'GetUserByIds')
  async getUserByIds(data): Promise<any> {
    const { userIds } = data as { userIds: string[] };
    userIds.forEach((userId) => {
      if (!this.validateMongoId(userId)) {
        throw GrpcErrorException.InvalidArgument('userId must be ObjectId', ErrorCode.Common.INVALID_INPUT);
      }
    });
    // find user with isVerified
    const users = await this.userService.findUserByIds(userIds, {}, true);

    return {
      users: users.map((user) => ({
        ...user,
        loginType: this.getUserType(user),
      })),
    };
  }

  @GrpcMethod('AuthService', 'GetUserByEmail')
  async getUserByEmail(data): Promise<any> {
    const { email } = data as { email: string };
    if (!this.validateEmail(email)) {
      throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    const user = await this.userService.findUserByEmail(email, null);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    return {
      ...user,
      /**
       * @deprecated
       * We can use `loginService`
       */
      loginType: this.getUserType(user),
      loginService: this.userService.isUserUsingPassword(user) ? LoginService.EMAIL_PASSWORD : user.loginService,
      isTermsOfUseVersionChanged: this.userService.checkTermsOfUseVersionChanged(user),
    };
  }

  @GrpcMethod('AuthService', 'GetUserByEmails')
  async getUserByEmails(data): Promise<any> {
    const { emails } = data as { emails: string[]};
    emails.forEach((email) => {
      if (!this.validateEmail(email)) {
        throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
      }
    });
    const users = await this.userService.findUserByEmails(emails);
    return {
      users: users.map((user) => ({
        ...user,
        loginType: this.getUserType(user),
      })),
    };
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(data): Promise<any> {
    const error = await this.authService.changePassword(data);
    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GrpcErrorException.ApplicationError(error);
    }
  }

  @GrpcMethod('AuthService', 'CheckResetPasswordUrl')
  async checkResetPasswordUrl(data): Promise<any> {
    try {
      const { token } = data as { token: string };
      const tokenData = this.jwtService.verify(token, {
        ignoreExpiration: false,
      });
      const resetPasswordToken = await this.redisService.getResetPasswordToken(tokenData.email as string);
      if (token !== resetPasswordToken) {
        throw GrpcErrorException.Unknown('Token is invalid', ErrorCode.Common.REQUEST_ALREADY_SENT);
      }
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw GrpcErrorException.Unknown('token_expired', ErrorCode.Common.TOKEN_EXPIRED);
      }
      throw GrpcErrorException.Unknown('Error when check reset password token', ErrorCode.User.ACCOUNT_BLOCKED);
    }
  }

  @GrpcMethod('AuthService', 'VerifyToken')
  async verifyToken(data): Promise<any> {
    const { accessToken, refreshToken } = data as { accessToken: string, refreshToken: string};
    if (!accessToken || !refreshToken) {
      throw GrpcErrorException.InvalidArgument(
        'accessToken and refreshToken are missing',
        ErrorCode.Common.INVALID_INPUT,
      );
    }
    const { error, user } = await this.authService.verifyTokens(
      accessToken,
      refreshToken,
    );
    if (error) {
      throw GrpcErrorException.ApplicationError(error);
    }
    return user;
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(
    data,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = data as { refreshToken: string };
    if (!refreshToken) {
      throw GrpcErrorException.InvalidArgument('refreshToken are missing', ErrorCode.Common.INVALID_INPUT);
    }
    const { user, error } = await this.authService.verifyRefreshToken(
      refreshToken,
    );
    if (error) {
      throw GrpcErrorException.ApplicationError(error);
    }
    const {
      token,
      refreshToken: newRefreshToken,
    } = this.authService.getAuthToken({ data: user });
    await this.redisService.removeRefreshToken(user._id as string, refreshToken);
    await this.redisService.setRefreshToken(user._id as string, newRefreshToken);
    return {
      accessToken: token,
      refreshToken: newRefreshToken,
    };
  }

  @ApiOperation({ summary: 'Get new access and refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'The new access and refresh tokens along with user data',
    type: RefreshTokenResponse,
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @Post('get-refresh-token')
  @UsePipes(new ValidationPipeRest())
  async getRefreshToken(
    @Body() data: RefreshTokenDto,
    @Req() request,
  ): Promise<RefreshTokenResponse> {
    const { refreshToken } = data;
    if (!refreshToken) {
      throw HttpErrorException.BadRequest('refreshToken are missing', ErrorCode.Common.INVALID_INPUT);
    }
    const { user, error } = await this.authService.verifyRefreshToken(
      refreshToken,
    );
    if (error) {
      throw HttpErrorException.Forbidden(error.message, error.errorCode);
    }
    const ipAddress = Utils.getIpRequest(request);
    const {
      token,
      refreshToken: newRefreshToken,
      error: authTokenError,
    } = this.authService.getAuthToken({ data: user, ipAddress, isGraphqlRequest: false });
    if (authTokenError) {
      throw authTokenError;
    }
    await this.redisService.removeRefreshToken(user._id as string, refreshToken);
    await this.redisService.setRefreshToken(user._id as string, newRefreshToken);
    const { error: verifyTokenErr, user: newUserInfo } = await this.authService.verifyTokens(
      token,
      newRefreshToken,
    );
    const [userData, lastDomain] = await Promise.all([
      this.userService.findUserById(newUserInfo._id as string),
      this.userService.getLastAccessedOrg(newUserInfo._id as string),
    ]);
    const respUser = {
      _id: userData._id,
      email: userData.email,
      name: userData.name,
      avatarRemoteId: userData.avatarRemoteId,
      payment: userData.payment,
      setting: userData.setting,
      lastLogin: userData.lastLogin,
      createdAt: userData.createdAt,
      signatures: userData.signatures,
      isNotify: userData.isNotify,
      isUsingPassword: this.userService.isUserUsingPassword(userData),
      endTrial: null,
      type: userData.type,
      metadata: userData.metadata,
      lastAccessedOrgUrl: lastDomain,
    };
    if (verifyTokenErr) {
      throw HttpErrorException.Forbidden(verifyTokenErr.message);
    }
    return {
      accessToken: token,
      refreshToken: newRefreshToken,
      userData: respUser,
    };
  }

  @GrpcMethod('AuthService', 'ChangePassword')
  async changePassword(data): Promise<any> {
    const { newPassword, currentPassword, userId } = data as { newPassword: string, currentPassword: string, userId: string};
    if (!userId) {
      throw GrpcErrorException.InvalidArgument('userId is missing', ErrorCode.Common.INVALID_INPUT);
    }
    const changePasswordError = await this.userService.changePassword(
      newPassword,
      currentPassword,
      userId,
    );
    if (changePasswordError) {
      throw GrpcErrorException.ApplicationError(changePasswordError);
    }
  }

  @GrpcMethod('AuthService', 'UpdateUserPropertiesById')
  async updateUserPropertiesById(data): Promise<any> {
    const { userId, properties } = data;
    if (!userId) {
      throw GrpcErrorException.InvalidArgument('userId is missing', ErrorCode.Common.INVALID_INPUT);
    }

    const user = await this.userService.updateUserPropertyById(userId as string, properties, true);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    return {
      ...user,
      loginType: this.getUserType(user),
    };
  }

  @GrpcMethod('AuthService', 'SignOut')
  async signOut(data): Promise<any> {
    const { userId, accessToken, refreshToken }: {
      userId: string,
      accessToken: string,
      refreshToken: string,
    } = data;
    if (!userId) {
      throw GrpcErrorException.InvalidArgument('userId is missing', ErrorCode.Common.INVALID_INPUT);
    }

    await this.authService.signOut(userId, accessToken, refreshToken);
  }

  /**
   * @deprecated
   */
  @GrpcMethod('AuthService', 'VerifyPassword')
  async verifyPassword(data): Promise<any> {
    const { userId, password } = data as { userId: string, password: string };
    if (!userId) {
      throw GrpcErrorException.InvalidArgument('userId is missing', ErrorCode.Common.INVALID_INPUT);
    }

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
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

  @GrpcMethod('AuthService', 'resendVerifyEmail')
  async resendVerifyEmail(data): Promise<any> {
    const { email } = data as { email: string};
    if (!email) {
      throw GrpcErrorException.InvalidArgument('email is missing', ErrorCode.Common.INVALID_INPUT);
    }
    if (!this.validateEmail(email)) {
      throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    const isVerifyEmailSent = await this.redisService.getRedisValueWithKey(`verifyEmailSent:${email}`);

    if (isVerifyEmailSent) throw GrpcErrorException.Unknown('Verify email has been sent', ErrorCode.Common.REQUEST_ALREADY_SENT);
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    if (user.isVerified) throw GrpcErrorException.Unknown('User has been verified.', ErrorCode.User.USER_ALREADY_VERIFIED);
    const result = await this.authService.resendVerifyEmail(user);
    if (!result) {
      throw GrpcErrorException.Unknown('Error when trying to re-send verify email', ErrorCode.User.RESEND_VERIFY_EMAIL_FAIL);
    }
  }

  @GrpcMethod('AuthService', 'ResendVerifyAccountByEmail')
  async resendVerifyAccountByEmail(data): Promise<{ tokenVerifyAccount: string }> {
    const { email } = data as { email: string };
    if (!email) {
      throw GrpcErrorException.InvalidArgument('email is missing', ErrorCode.Common.INVALID_INPUT);
    }
    if (!this.validateEmail(email)) {
      throw GrpcErrorException.InvalidArgument('email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    const isVerifyEmailSent = await this.redisService.getRedisValueWithKey(`verifyEmailSent:${email}`);

    if (isVerifyEmailSent) throw GrpcErrorException.Unknown('Verify email has been sent', ErrorCode.Common.REQUEST_ALREADY_SENT);
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    if (user.isVerified) throw GrpcErrorException.Unknown('User has been verified.', ErrorCode.User.USER_ALREADY_VERIFIED);
    const { error, tokenVerifyAccount } = await this.authService.resendVerifyEmail(user);
    if (error) {
      throw GrpcErrorException.Unknown('Error when trying to re-send verify email', ErrorCode.User.RESEND_VERIFY_EMAIL_FAIL);
    }
    return {
      tokenVerifyAccount,
    };
  }

  @GrpcMethod('AuthService', 'VerifyEmail')
  async verifyEmail(data): Promise<any> {
    const { token } = data as { token: string };
    if (!token) {
      throw GrpcErrorException.InvalidArgument('token is missing', ErrorCode.Common.INVALID_INPUT);
    }
    const { tokenPayload, error } = this.authService.verifyTokenWithType(token, TOKEN_TYPE.VERIFY_ACCOUNT);
    if (error) {
      if (error.errorCode === ErrorCode.Common.TOKEN_EXPIRED) {
        return {
          email: this.jwtService.verify(token, { ignoreExpiration: true }).email,
          message: ErrorCode.Common.TOKEN_EXPIRED,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GrpcErrorException.ApplicationError(error);
    }
    const validVerifyToken = await this.redisService.getValidVerifyToken(tokenPayload.email as string);
    if (validVerifyToken && validVerifyToken !== token) {
      throw GrpcErrorException.Unknown('Invalid token', ErrorCode.Common.TOKEN_INVALID);
    }
    const validateEmail = Utils.validateEmail(tokenPayload.email as string);
    if (!validateEmail) {
      throw GrpcErrorException.Unknown('Email is not valid', ErrorCode.User.INVALID_EMAIL);
    }
    const result = await this.userService.verifyUserAccount(tokenPayload._id as string);
    if (result) {
      this.redisService.delValidVerifyToken(tokenPayload.email as string);

      return {
        email: tokenPayload.email,
        name: tokenPayload.name,
        message: 'Verification successful!',
      };
    }

    return {
      email: tokenPayload.email,
      name: tokenPayload.name,
      message: 'Your email address was successfully verified',
    };
  }

  @ApiOperation({ summary: 'Store contract information temporarily' })
  @ApiResponse({
    status: 200,
    type: ContractTemporaryResponse,
  })
  @Post('contract-temporary')
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  async putContractTemporary(@Body() data: ContractTemporaryDto): Promise<ContractTemporaryResponse> {
    const { contractInfo } = data;
    const { identify } = await this.authService.putContractTemporary(contractInfo);
    return {
      identify,
    };
  }

  @GrpcMethod('AuthService', 'CheckUserCompleteOnboardingWS')
  async hasJoinedOrg(data): Promise<any> {
    const { userId } = data as { userId: string };
    const [user, organizationMembership] = await Promise.all([
      this.userService.findUserById(userId),
      this.organizationService.getMembersByUserId(userId),
    ]);
    const isPremiumUser = user.payment.type !== PaymentPlanEnums.FREE;
    return { hasJoinedOrg: Boolean(organizationMembership.length), isPremiumUser };
  }
}
