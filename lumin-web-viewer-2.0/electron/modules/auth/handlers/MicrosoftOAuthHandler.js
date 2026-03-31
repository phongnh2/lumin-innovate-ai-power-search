const { TokenValidationError } = require('../errors');
const { MicrosoftUserDataExtractor } = require('../extractors/MicrosoftUserDataExtractor');
const { MicrosoftTokenParser } = require('../parsers/MicrosoftTokenParser');

class MicrosoftOAuthHandler {
  constructor(options = {}) {
    this.tokenParser = options.tokenParser || new MicrosoftTokenParser();
    this.userDataExtractor = options.userDataExtractor || new MicrosoftUserDataExtractor();
    this.isDev = options.isDev || false;
  }

  handleRedirect(url, callbackRoute) {
    if (!url || typeof url !== 'string') {
      throw new TokenValidationError('Invalid URL provided: must be a non-empty string');
    }

    if (!callbackRoute || typeof callbackRoute !== 'string') {
      throw new TokenValidationError('Invalid callback route provided: must be a non-empty string');
    }

    const parsedData = this.tokenParser.parseCallbackUrl(url, callbackRoute);

    if (!parsedData) {
      return null;
    }

    const { accessToken, idToken, scope, error, errorDescription } = parsedData;

    this.tokenParser.validateTokenData(accessToken, error, errorDescription);

    const decodedPayload = this.tokenParser.decodeIdToken(idToken);
    const userData = this.userDataExtractor.extractUserData(decodedPayload, this.isDev);

    return {
      access_token: accessToken,
      cid: userData.cid,
      scope,
      email: userData.email,
      oid: userData.oid,
    };
  }
}

module.exports = { MicrosoftOAuthHandler };
