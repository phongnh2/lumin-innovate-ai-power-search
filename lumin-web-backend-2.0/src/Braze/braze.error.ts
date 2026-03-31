import { AxiosError } from 'axios';

export class BrazeError extends Error {
  public readonly statusCode?: number;

  public readonly errorCode?: string;

  public readonly context: string;

  public readonly responseData?: any;

  public readonly url?: string;

  public readonly method?: string;

  constructor(
    message: string,
    context: string,
    statusCode?: number,
    errorCode?: string,
    responseData?: any,
    originalError?: AxiosError,
    url?: string,
    method?: string,
  ) {
    super(message);
    this.name = 'BrazeError';
    this.context = context;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.responseData = responseData;
    this.url = url;
    this.method = method;

    if (originalError?.stack) {
      this.stack = originalError.stack;
    }
  }

  static fromAxiosError(error: AxiosError, context: string): BrazeError {
    const responseData = error.response?.data;
    const statusCode = error.response?.status;
    const errorCode = error.code;
    const url = error.config?.url || error.request?.responseURL;
    const method = error.config?.method?.toUpperCase();
    const errorMessage = this.extractErrorMessage(error, responseData, statusCode);

    return new BrazeError(
      errorMessage,
      context,
      statusCode,
      errorCode,
      responseData,
      error,
      url as string,
      method,
    );
  }

  private static extractErrorMessage(
    error: AxiosError,
    responseData?: any,
    statusCode?: number,
  ): string {
    if (responseData) {
      if (typeof responseData === 'string') {
        return responseData;
      }

      if (responseData.message) {
        return responseData.message;
      }

      if (responseData.errors) {
        const { errors } = responseData;
        return Array.isArray(errors)
          ? (errors as string[]).join(', ')
          : JSON.stringify(errors);
      }

      if (statusCode) {
        return `Braze API error (${statusCode}): ${JSON.stringify(responseData)}`;
      }
    }

    if (statusCode) {
      return `Braze API error (${statusCode}): ${error.message || 'Unknown error'}`;
    }

    return error.message || 'Unknown Braze API error';
  }
}
