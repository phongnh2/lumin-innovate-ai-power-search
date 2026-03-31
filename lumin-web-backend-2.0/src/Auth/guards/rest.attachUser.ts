import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { EnvironmentService } from 'Environment/environment.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { UserService } from 'User/user.service';

@Injectable()
export class RestAttachUserGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly whitelistIPService: WhitelistIPService,
    private readonly environmentService: EnvironmentService,
  // eslint-disable-next-line no-empty-function
  ) { }

  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  async canActivate(context: ExecutionContext) {
    const request: IGqlRequest = context.switchToHttp().getRequest();
    const ipAddress = Utils.getIpRequest(request);
    if (!request) {
      return false;
    }
    const isRequestFromMobile = request.headers[CommonConstants.MOBILE_REQUEST_HEADER];
    if (isRequestFromMobile) {
      return this.authenticateFromMobile(request);
    }
    try {
      const oryAuthorizationToken = this.authService.getOryAuthorizationToken(request.headers);
      const session = await this.authService.getSession(oryAuthorizationToken);
      this.authService.ensureSessionWithVerifiedEmail(session);
      // const isTokenBlacklisted = await this.redisService.checkKeyBlackList(session.id);
      // if (isTokenBlacklisted) {
      //   throw HttpErrorException.Unauthorized('Token is blacklisted', ErrorCode.Common.TOKEN_INVALID);
      // }
      let user = await this.userService.findUserByEmail(session.identity.traits.email as string);
      user = await this.userService.verifyUserFromExistingSession(user);
      // In case backend fails to receive callback from Kratos in registration flow
      if (!user) {
        user = await this.authService.newUserFromExistingKratosSession(session);
      }
      const { error: ipAddressError } = this.whitelistIPService.validateIPRequest({ isGraphqlRequest: false, email: user.email, ipAddress });
      if (ipAddressError) {
        throw ipAddressError;
      }
      request.user = user;
    } catch (err) {
      // eslint-disable-next-line camelcase
      if (typeof err?.error_code === 'function' && err?.error_code() === ErrorCode.Common.INVALID_IP_ADDRESS) {
        throw err;
      }
    }
    return true;
  }

  async authenticateFromMobile(request: IGqlRequest): Promise<boolean> {
    const ipAddress = Utils.getIpRequest(request);
    const refreshTokenHeader: string = request.headers[CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER];
    if (refreshTokenHeader) {
      try {
        const { decoded, error } = await this.authService.validateRefreshToken(refreshTokenHeader, false, ipAddress);
        if (error) {
          throw error;
        }
        request.user = await this.userService.findUserById(decoded._id as string);
      } catch (error) {
        // eslint-disable-next-line camelcase
        if (error?.error_code === ErrorCode.Common.INVALID_IP_ADDRESS) {
          throw error;
        }
      }
    }
    return true;
  }
}
