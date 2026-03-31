import { Injectable } from '@nestjs/common';
import { Session } from '@ory/client';
import { JWK, createLocalJWKSet, jwtVerify } from 'jose';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

@Injectable()
export class OryJwtService {
  private oryAuthenticationJwk: JWK;

  private oryAuthorizationJwk: JWK;

  constructor(
    private readonly environmentService: EnvironmentService,
  ) {
    // eslint-disable-next-line max-len
    const decodedAuthentication = Buffer.from(this.environmentService.getByKey(EnvConstants.JWT_AUTHENTICATION_PUBLIC_KEY), 'base64').toString('utf8');
    this.oryAuthenticationJwk = JSON.parse(decodedAuthentication);

    const decodedAuthorization = Buffer.from(this.environmentService.getByKey(EnvConstants.JWT_AUTHORIZATION_PUBLIC_KEY), 'base64').toString('utf8');
    this.oryAuthorizationJwk = JSON.parse(decodedAuthorization);
  }

  async verifyOryAuthenticationToken(token: string): Promise<Partial<Session>> {
    const key = createLocalJWKSet({
      keys: [this.oryAuthenticationJwk],
    });

    const { payload } = await jwtVerify(token, key, { clockTolerance: '30 seconds' });

    return payload.session as Partial<Session>;
  }

  async verifyOryAuthorizationToken(token: string): Promise<Partial<Session>> {
    const key = createLocalJWKSet({
      keys: [this.oryAuthorizationJwk],
    });

    const { payload } = await jwtVerify(token, key, { clockTolerance: '30 seconds' });

    return payload.session as Partial<Session>;
  }
}
