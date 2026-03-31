import {
  CanActivate, ExecutionContext, Injectable, applyDecorators, SetMetadata, UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { EnvironmentService } from 'Environment/environment.service';

type RequestData = {
  query: Record<string, string>,
  headers: Record<string, string>,
}

@Injectable()
export class LambdaAuthGuardInstance implements CanActivate {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly reflector: Reflector,
  ) { }

  private getRequestData = (context: ExecutionContext): RequestData => {
    const request = context.switchToHttp().getRequest();
    const { query, headers } = request;
    return { query, headers };
  };

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const apiKeyName = this.reflector.getAllAndOverride<string>('apiKeyName', [context.getHandler(), context.getClass()]) || '';
    const apiKeyValue = this.environmentService.getByKey(apiKeyName).trim();
    const { headers } = this.getRequestData(context);
    const remoteApiKey = headers['x-lumin-api-key'];

    if (!remoteApiKey || !apiKeyValue || remoteApiKey !== apiKeyValue) {
      throw HttpErrorException.Unauthorized('Invalid API key');
    }
    return true;
  }
}

export function LambdaAuthGuard(apiKeyName: string) {
  return applyDecorators(
    SetMetadata('apiKeyName', apiKeyName),
    UseGuards(LambdaAuthGuardInstance),
  );
}
