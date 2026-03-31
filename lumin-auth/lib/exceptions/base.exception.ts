export class BaseException {
  constructor(
    private readonly statusCode: number,
    private readonly message: string,
    private readonly code?: string | number,
    private readonly meta?: Record<string, unknown>
  ) {}

  public getStatus() {
    return this.statusCode;
  }

  public getResponseError() {
    return {
      code: this.code,
      message: this.message,
      meta: this.meta
    };
  }

  public getMetaData() {
    return this.meta;
  }
}
