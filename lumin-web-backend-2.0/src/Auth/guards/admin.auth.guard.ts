import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { EnvironmentService } from 'Environment/environment.service';
import { RedisService } from 'Microservices/redis/redis.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly redisService: RedisService,
  ) { }

  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    if (!request) {
      return false;
    }
    const authHeader = request.headers[CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER];
    const { scheme: tokenScheme, value: token } = Utils.parseAuthHeader(authHeader);
    const isValidToken = await this.redisService.validateToken(token);
    if (tokenScheme !== CommonConstants.AUTHORIZATION_HEADER_BEARER || !isValidToken) {
      throw GraphErrorException.Unauthorized('Token is invalid', ErrorCode.Common.TOKEN_INVALID);
    }
    try {
      const decodeTokenFromClient = Utils.decryptData(token, this.cryptoKey);
      const decoded = this.jwtService.verify(decodeTokenFromClient);
      const isValidData = decoded.userType === APP_USER_TYPE.SALE_ADMIN;
      if (!isValidData) {
        throw GraphErrorException.Unauthorized('Token data is invalid', ErrorCode.Common.TOKEN_INVALID);
      }
      request.user = decoded;
      return true;
    } catch (e) {
      if (e && e.name === CommonConstants.TOKEN_EXPIRED_ERROR) {
        throw GraphErrorException.Unauthorized('Session has been expired', ErrorCode.Common.TOKEN_EXPIRED);
      }
      throw GraphErrorException.Unauthorized('Authentication Error');
    }
  }
}
