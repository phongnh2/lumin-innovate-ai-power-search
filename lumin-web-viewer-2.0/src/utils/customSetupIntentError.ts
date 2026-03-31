export class CustomSetupIntentError extends Error {
  constructor(message: string, errorCode: string) {
    super(message);
    this.message = message;
    this.name = errorCode;
  }
}
