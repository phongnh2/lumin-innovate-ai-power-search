/* eslint-disable max-len */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Session } from '@ory/client';
import { errors } from 'jose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { serverTiming } from 'Common/timing/servertiming';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { EnvironmentService } from 'Environment/environment.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IUserContext } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly environmentService: EnvironmentService,
    private readonly whitelistIPService: WhitelistIPService,
  ) { }

  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const startTime = process.hrtime();
    const request = Utils.getGqlRequest(context);
    const ipAddress = Utils.getIpRequest(request);
    if (!request) {
      return false;
    }
    const isRequestFromMobile = request.headers[CommonConstants.MOBILE_REQUEST_HEADER];
    if (isRequestFromMobile) {
      const { isAccept, error } = await this.authService.authenticateFromMobile(request, true);
      if (error) {
        throw error;
      }
      return isAccept;
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
      // check user exist by email
      let user = await this.userService.findUserByEmail(session.identity.traits.email as string);
      if (user) {
        const { loginService, identityId, isVerified } = user;
        const updateObj = {
          loginService: loginService || session.identity.traits.loginService,
          identityId: identityId || session.identity.id,
          isVerified: true,
        };
        if (!loginService || !identityId || !isVerified) {
          user = await this.userService.updateUserPropertyById(user._id, updateObj, true);
        }
        const { error: ipAddressError } = this.whitelistIPService.validateIPRequest({ isGraphqlRequest: true, email: user.email, ipAddress });
        if (ipAddressError) {
          throw ipAddressError;
        }
      } else {
        user = await this.authService.newUserFromExistingKratosSession(session);
      }
      request.user = {
        ...user,
        geoLocation: Utils.getGeoLocationFromRequestHeaders(request),
        countryCode: Utils.getGeoLocationFromRequestHeaders(request).countryCode,
      } as IUserContext;
      request.session = session;
      serverTiming.setTiming(request.res, process.hrtime(startTime), 'auth');
      return true;
    } catch (err) {
      if (err?.code === 'ERR_JWT_EXPIRED') {
        throw GraphErrorException.Unauthorized('Token expired', ErrorCode.Common.TOKEN_EXPIRED);
      }
      if (err?.message === 'Missing authorization token') {
        throw GraphErrorException.Unauthorized('Missing authorization token', ErrorCode.Common.TOKEN_INVALID);
      }
      if (typeof err?.getErrorCode === 'function' && err.getErrorCode() === ErrorCode.Common.INVALID_IP_ADDRESS) {
        throw err;
      }
      if (err instanceof errors.JWTClaimValidationFailed) {
        throw GraphErrorException.Unauthorized('Authentication Error', err.code, { claim: err.claim, reason: err.reason });
      }

      throw GraphErrorException.Unauthorized('Authentication Error');
    }
  }
}
