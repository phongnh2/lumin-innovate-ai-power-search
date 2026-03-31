const { AuthenticationError } = require('./AuthenticationError');

class TokenParseError extends AuthenticationError {
  constructor(message, details) {
    super(message, 'TOKEN_PARSE_ERROR', details);
    this.name = 'TokenParseError';
  }
}

module.exports = { TokenParseError };
