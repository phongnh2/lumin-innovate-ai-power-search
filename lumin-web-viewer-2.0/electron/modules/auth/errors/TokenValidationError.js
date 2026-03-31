const { AuthenticationError } = require('./AuthenticationError');

class TokenValidationError extends AuthenticationError {
  constructor(message, details) {
    super(message, 'TOKEN_VALIDATION_ERROR', details);
    this.name = 'TokenValidationError';
  }
}

module.exports = { TokenValidationError };
