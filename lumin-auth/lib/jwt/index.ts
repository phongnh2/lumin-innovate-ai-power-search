import { Session } from '@ory/client';
import { JWK, createLocalJWKSet, jwtVerify } from 'jose';

import { environment } from '@/configs/environment';

class JWTService {
  static instance: JWTService;
  private authenticationJwk: JWK;
  private authorizationJwk: JWK;
  constructor() {
    if (JWTService.instance) {
      return JWTService.instance;
    }
    const decodedAuthentication = Buffer.from(environment.internal.jwt.authenticationJwk, 'base64').toString('utf8');
    this.authenticationJwk = JSON.parse(decodedAuthentication);

    const decodedAuthorization = Buffer.from(environment.internal.jwt.authorizationJwk, 'base64').toString('utf8');
    this.authorizationJwk = JSON.parse(decodedAuthorization);
    JWTService.instance = this;
  }

  async verifyAuthenticationToken(token: string): Promise<Partial<Session>> {
    const key = createLocalJWKSet({
      keys: [this.authenticationJwk]
    });

    const { payload } = await jwtVerify(token, key, { clockTolerance: '30 seconds' });

    return payload.session as Partial<Session>;
  }

  async verifyAuthorizationToken(token: string): Promise<Partial<Session>> {
    const key = createLocalJWKSet({
      keys: [this.authorizationJwk]
    });

    const { payload } = await jwtVerify(token, key, { clockTolerance: '30 seconds' });

    return payload.session as Partial<Session>;
  }
}

export default JWTService;
