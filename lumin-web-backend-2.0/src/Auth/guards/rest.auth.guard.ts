import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { FlowContext } from 'Common/interceptors/FlowId.interceptor';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { EnvironmentService } from 'Environment/environment.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { UserService } from 'User/user.service';

@Injectable()
export class RestAuthGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly whitelistIPService: WhitelistIPService,
    private readonly environmentService: EnvironmentService,
    private readonly reflector: Reflector,
  ) { }

  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ipAddress = Utils.getIpRequest(request);
    const openGoogleFlowCtx = this.reflector.get<FlowContext>(
      'flow_context',
      context.getHandler(),
    );
    if (!request) {
      return false;
    }
    const isRequestFromMobile = request.headers[CommonConstants.MOBILE_REQUEST_HEADER];
    if (isRequestFromMobile) {
      const { isAccept, error } = await this.authService.authenticateFromMobile(request, false);
      if (error) {
        throw error;
      }
      return isAccept;
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
      // In case backend fails to receive callback from Kratos in registration flow
      user = await this.userService.verifyUserFromExistingSession(user);
      if (!user) {
        user = await this.authService.newUserFromExistingKratosSession(session);
      }
      if (!user.identityId) {
        user = await this.userService.updateUserPropertyById(user._id, {
          identityId: session.identity.id,
        }, false, { lean: false });
      }
      const { error: ipAddressError } = this.whitelistIPService.validateIPRequest({ isGraphqlRequest: false, email: user.email, ipAddress });
      if (ipAddressError && !openGoogleFlowCtx) {
        throw ipAddressError;
      }
      request.session = session;
      request.user = user;
      return true;
    } catch (err) {
      if (err?.code === 'ERR_JWT_EXPIRED') {
        throw HttpErrorException.Unauthorized('Token expired', ErrorCode.Common.TOKEN_EXPIRED);
      }
      if (err?.message === 'Missing authorization token') {
        throw HttpErrorException.Unauthorized('Missing authorization token', ErrorCode.Common.TOKEN_INVALID);
      }
      // eslint-disable-next-line camelcase
      if (err?.error_code === ErrorCode.Common.INVALID_IP_ADDRESS) {
        throw err;
      }
      throw HttpErrorException.Unauthorized('Authentication Error');
    }
  }
}
