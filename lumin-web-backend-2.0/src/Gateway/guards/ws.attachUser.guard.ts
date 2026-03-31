import {
  CanActivate, ExecutionContext, forwardRef, Inject, Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { UserService } from 'User/user.service';

@Injectable()
export class WSAttachUserGuard implements CanActivate {
  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  async handleRequestFromMobile(client: any): Promise<void> {
    const { refreshToken } = client.handshake.query;
    if (!refreshToken) {
      return;
    }
    const decodeRefreshTokenFromClient = Utils.decryptData(refreshToken, this.cryptoKey);
    const decoded = this.jwtService.verify(decodeRefreshTokenFromClient);
    const isValidRefreshToken = await this.redisService.checkRefreshToken(decoded._id as string, refreshToken as string);
    if (!isValidRefreshToken) {
      return;
    }
    const user = await this.userService.findUserById(decoded._id as string);
    client.isRequestFromMobile = true;
    client.user = user;
  }

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const { cookie }: { cookie: string } = client.handshake.headers;
    const anonymousUserId = cookie && cookie.split('; ').find((item) => item.startsWith(CommonConstants.ANONYMOUS_USER_ID_COOKIE))?.split('=')[1];
    client.anonymousUserId = anonymousUserId;
    try {
      const isRequestFromMobile = client.handshake.query[CommonConstants.MOBILE_REQUEST_HEADER];
      if (isRequestFromMobile) {
        await this.handleRequestFromMobile(client);
        return true;
      }
    } catch (err) {
      return true;
    }
    const identityInfo = client.server.sockets.sockets.get(client.id);
    if (!identityInfo._lumin_identity) {
      return true;
    }
    const user = await this.userService.findUserByEmail(identityInfo._lumin_identity.email as string);
    client.user = {
      ...user,
      sessionId: identityInfo._lumin_identity.sessionId,
    };
    return true;
  }
}
