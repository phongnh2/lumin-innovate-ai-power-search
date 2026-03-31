class AuthenticationError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.details = details;
  }
}

module.exports = { AuthenticationError };
