const { ERROR_MESSAGES } = require('../../../constants/errorConstants');
const { OAUTH2_PARAMS } = require('../../../constants/oauthConstants');
const { TokenParseError, TokenValidationError } = require('../errors');

class MicrosoftTokenParser {
  parseCallbackUrl(url, callbackRoute) {
    if (!url.includes(callbackRoute)) {
      return null;
    }

    try {
      const parsedUrl = new URL(url);
      const hash = parsedUrl.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get(OAUTH2_PARAMS.ACCESS_TOKEN);
      const idToken = params.get(OAUTH2_PARAMS.ID_TOKEN);
      const scope = params.get(OAUTH2_PARAMS.SCOPE);
      const error = params.get(OAUTH2_PARAMS.ERROR);
      const errorDescription = params.get(OAUTH2_PARAMS.ERROR_DESCRIPTION);

      return {
        accessToken,
        idToken,
        scope: scope || '',
        error,
        errorDescription,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      throw new TokenParseError(`${ERROR_MESSAGES.FAILED_PARSE_AUTH_RESPONSE} ${errorMessage}`, { cause: error });
    }
  }

  decodeIdToken(idToken) {
    if (!idToken) {
      return null;
    }

    try {
      const tokenParts = idToken.split('.');

      if (tokenParts.length !== 3) {
        throw new TokenValidationError('Invalid ID token format: expected 3 parts');
      }

      return JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    } catch (error) {
      if (error instanceof TokenValidationError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      throw new TokenParseError(`Failed to decode ID token: ${errorMessage}`, { cause: error });
    }
  }

  validateTokenData(accessToken, error, errorDescription) {
    if (error) {
      throw new TokenValidationError(`${ERROR_MESSAGES.AUTHENTICATION_FAILED} ${errorDescription || error}`);
    }

    if (!accessToken) {
      throw new TokenValidationError(ERROR_MESSAGES.AUTHENTICATION_FAILED_NO_TOKEN);
    }
  }
}

module.exports = { MicrosoftTokenParser };
