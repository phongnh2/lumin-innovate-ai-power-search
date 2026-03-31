/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { of } from 'rxjs';

import { Utils } from 'Common/utils/Utils';

const sanitize = require('mongo-sanitize');

@Injectable()
export class SanitizeInputInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    let args = Utils.getGqlArgs(context);
    if (!args) {
      return of([]);
    }
    try {
      const variables = JSON.parse(JSON.stringify(args));
      const sanitizeVariables = sanitize(variables);
      args = sanitizeVariables;
    } catch (error) {
      return next
        .handle()
        .pipe();
    }
    return next.handle();
  }
}
