import {
  HttpException,
} from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    private readonly code: string,
    statusCode: number,
    private readonly metadata?: Record<string, unknown>,
  ) {
    super(message, statusCode);
  }

  get error_code() {
    return this.code;
  }

  get error_metadata() {
    return this.metadata;
  }
}
