import {
  HttpStatus,
} from '@nestjs/common';

import { GraphqlException } from 'Common/errors/graphql/GraphException';

export class ConflictException extends GraphqlException {
  constructor(message: string, code: string, metadata: Record<string, any>) {
    super(message, code, HttpStatus.CONFLICT, metadata);
  }
}
