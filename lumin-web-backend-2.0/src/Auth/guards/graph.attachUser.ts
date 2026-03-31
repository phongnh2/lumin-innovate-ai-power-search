import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Session } from '@ory/client';

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
export class GqlAttachUserGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly whitelistIPService: WhitelistIPService,
    private readonly environmentService: EnvironmentService,
  ) { }

  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const ipAddress = Utils.getIpRequest(request);
    if (!request) {
      return false;
    }
    const isRequestFromMobile = request.headers[CommonConstants.MOBILE_REQUEST_HEADER];
    if (isRequestFromMobile) {
      return this.authenticateFromMobile(request);
    }
    try {
      let session: Partial<Session> = null;
      if (request.headers[CommonConstants.GRAPHQL_SOCKET_AUTH]) {
        session = request.headers[CommonConstants.GRAPHQL_SOCKET_AUTH];
      } else {
        const oryAuthorizationToken = this.authService.getOryAuthorizationToken(request.headers);
        session = await this.authService.getSession(oryAuthorizationToken);
        this.authService.ensureSessionWithVerifiedEmail(session);
      }
      let user = await this.userService.findUserByEmail(session.identity.traits.email as string);
      user = await this.userService.verifyUserFromExistingSession(user);
      // In case backend fails to receive callback from Kratos in registration flow
      if (!user) {
        user = await this.authService.newUserFromExistingKratosSession(session);
      }
      const { error: ipAddressError } = this.whitelistIPService.validateIPRequest({ isGraphqlRequest: true, email: user.email, ipAddress });
      if (ipAddressError) {
        throw ipAddressError;
      }
      request.user = user;
    } catch (err) {
      if (typeof err?.getErrorCode === 'function' && err?.getErrorCode() === ErrorCode.Common.INVALID_IP_ADDRESS) {
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
        const { decoded, error } = await this.authService.validateRefreshToken(refreshTokenHeader, true, ipAddress);
        if (error) {
          throw error;
        }
        request.user = await this.userService.findUserById(decoded._id as string);
      // eslint-disable-next-line no-empty
      } catch (error) {
        if (typeof error?.getErrorCode === 'function' && error?.getErrorCode() === ErrorCode.Common.INVALID_IP_ADDRESS) {
          throw error;
        }
      }
    }
    return true;
  }
}
