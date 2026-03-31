import { Injectable } from '@nestjs/common';
import { importJWK, JWK, SignJWT } from 'jose';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class AsymmetricJwtService {
  private privateKey: string;

  private privateKeyJwk: JWK;

  constructor(
private readonly environmentService: EnvironmentService,
     readonly loggerService: LoggerService,
  ) {
    this.privateKey = this.environmentService.getByKey(EnvConstants.PRIVATE_KEY_SIGNED_RESPONSE);
    /*
        Create asymmetric key with `jose` package:
        const { publicKey, privateKey } = await generateKeyPair('RS256');
        // Export to JWK format
        const publicJwk = await exportJWK(publicKey);
        const privateJwk = await exportJWK(privateKey);
      */
    this.privateKeyJwk = JSON.parse(Buffer.from(this.privateKey, 'base64').toString('utf8')) as JWK;
  }

  async sign(payload: Record<string, any>, options?: { expiresIn?: number | string, jwk?: JWK }): Promise<string> {
    try {
      const decodePrivateKey = await importJWK(options?.jwk || this.privateKeyJwk, 'RS256');

      let jwt = new SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256' });

      if (options?.expiresIn) {
        jwt = jwt.setExpirationTime(options?.expiresIn);
      }

      const signedJwt = await jwt.sign(decodePrivateKey);

      return signedJwt;
    } catch (error) {
      this.loggerService.error({
        error,
        message: AsymmetricJwtService.name,
      });
      throw error;
    }
  }
}
