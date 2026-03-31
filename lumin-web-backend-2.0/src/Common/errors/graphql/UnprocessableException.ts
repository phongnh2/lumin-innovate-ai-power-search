import {
  HttpStatus,
} from '@nestjs/common';

import { GraphqlException } from 'Common/errors/graphql/GraphException';

export class UnprocessableException extends GraphqlException {
  constructor(message: string, code: string, metadata: Record<string, any>) {
    super(message, code, HttpStatus.UNPROCESSABLE_ENTITY, metadata);
  }
}
