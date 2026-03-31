import { GraphQLError } from 'graphql';

export class GraphqlException extends GraphQLError {
  constructor(message: string, code: string, statusCode: number, metadata: any) {
    super(message, { extensions: { code, statusCode, metadata } });
  }

  getMetadata(): any {
    return this.extensions.metadata;
  }

  getStatus(): number {
    return this.extensions.statusCode as number;
  }

  getErrorCode(): string {
    return this.extensions.code as string;
  }
}
