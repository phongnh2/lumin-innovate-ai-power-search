import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as crypto from 'crypto';
import { Observable, map, catchError } from 'rxjs';

import { CONCURRENT_REQUEST_KEY, ConcurrentRequestOptions } from 'Common/decorators/concurrent-request.decorator';
import { SKIP_MUTATION_LOCK_KEY } from 'Common/decorators/skip-mutation-lock.decorator';

import { RedisService } from 'Microservices/redis/redis.service';

@Injectable()
export class ConcurrentRequestInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    // Skip if not a GraphQL request or not a mutation
    if (!info || info.parentType?.name !== 'Mutation') {
      return next.handle();
    }

    // Check if this mutation should skip locking
    const skipLock = this.reflector.get<boolean>(
      SKIP_MUTATION_LOCK_KEY,
      context.getHandler(),
    );
    if (skipLock) {
      return next.handle();
    }

    const request = ctx.getContext();
    const user = request?.req?.user as { _id?: { toString(): string }; email?: string } | null | undefined;

    // Skip lock for unauthenticated requests to prevent blocking concurrent
    // public mutations (e.g., signIn, signUp) from different users since they
    // would all share the same 'anonymous' key, or for e2e test emails to allow concurrent test requests
    if (!user?._id || (user?.email && /^e2e(\+.*)?@luminpdf\.com$/.test(user.email))) {
      return next.handle();
    }

    const operationName = info.fieldName as string;

    const concurrentRequestOptions = this.reflector.get<ConcurrentRequestOptions>(
      CONCURRENT_REQUEST_KEY,
      context.getHandler(),
    ) || {};

    const key = this.generateKey(user._id.toString(), operationName, concurrentRequestOptions.key || '');
    const lock = await this.redisService.setKeyIfNotExist(key, '1', '300000');
    if (!lock) {
      throw new ConflictException('Another request with the same input is currently being processed. Please try again later.');
    }

    return next.handle().pipe(
      map((data) => {
        this.redisService.deleteRedisByKey(key);
        return data;
      }),
      catchError((error) => {
        this.redisService.deleteRedisByKey(key);
        throw error;
      }),
    );
  }

  private generateKey(userId: string, operationName: string, customKey: string): string {
    const hash = crypto.createHash('sha256');
    const keyData = {
      userId,
      operationName,
      customKey,
    };
    hash.update(JSON.stringify(keyData));
    return `mutation-lock:${hash.digest('hex')}`;
  }
}
