import { importJWK, JWK, jwtVerify } from 'jose';

import logger from 'helpers/logger';

import { PUBLIC_KEY_VERIFY_SIGNED_RESPONSE } from 'constants/urls';

export async function verifySignedResponse(token: string, context?: string) {
  let currentDate: Date | null = null;
  try {
    const jwk = JSON.parse(atob(PUBLIC_KEY_VERIFY_SIGNED_RESPONSE)) as JWK;
    const publicKey = await importJWK(jwk, 'RS256');

    currentDate = new Date();
    const { payload } = await jwtVerify(token, publicKey, {
      currentDate,
    });

    return payload;
  } catch (err) {
    logger.logError({
      error: err,
      attributes: {
        now: Math.round(currentDate.getTime() / 1000),
        exp: (err as { payload: { exp: number } }).payload?.exp,
        signedResponse: token,
        funcContext: context,
      },
      reason: 'VERIFY_SIGNED_RESPONSE',
    });
    return null;
  }
}
