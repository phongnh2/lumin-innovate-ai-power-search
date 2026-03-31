/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  CanActivate,
  Injectable,
  forwardRef,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { OperationMapping } from 'Common/constants/OperationMapping';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { serverTiming } from 'Common/timing/servertiming';
import { Utils } from 'Common/utils/Utils';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { IGqlResponse } from 'Auth/interfaces/IGqlResponse';
import { ContextType } from 'constant';
import { RedisService } from 'Microservices/redis/redis.service';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { UserService } from 'User/user.service';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly rateLimiterService: RateLimiterService,
    protected readonly reflector: Reflector,
  ) { }

  async limitbyUserId(request: IGqlRequest): Promise<string> {
    const { user: payload } = request;
    const user = await this.userService.findUserById(payload._id as string, { _id: 1 });
    if (!user) {
      return '';
    }
    return user._id;
  }

  limitByIpAddress(request: IGqlRequest): string {
    return request.headers[CommonConstants.X_FORWARDED_FOR_HEADER]
      || request.headers[CommonConstants.CF_CONNECTING_IP]
      || request.headers[CommonConstants.TRUE_CLIENT_IP]
      || CommonConstants.DEFAULT_IP_ADDRESS;
  }

  limitByEmail(request: IGqlRequest): string {
    return request.body?.variables?.email || request.body?.variables[Object.keys(request.body.variables as Record<string, unknown>)[0]]?.email;
  }

  limitByIngressCookie(request: IGqlRequest): string {
    return request.cookies[CommonConstants.RATE_LIMIT_INGRESS_COOKIE_HEADER];
  }

  limitByAnonymousUserId(request: IGqlRequest): string {
    return request.cookies[CommonConstants.ANONYMOUS_USER_ID_COOKIE];
  }

  async handleCheckRateLimit(
    context: ExecutionContext,
    request: IGqlRequest,
    response: IGqlResponse,
    operationName: string,
    combineStrategies: string,
  ): Promise<void> {
    const { user } = request;
    const userData = user?._id && await this.userService.findUserById(user._id as string);
    const { total, expire }: { total: number, expire: number} = await this.rateLimiterService.lookup(userData, operationName);
    const defaultLimit = {
      total: Number(total),
      remaining: Number(total),
      expire: Number(expire),
    };
    const existingLimit = await this.redisService.getRateLimitEndpoint(operationName, combineStrategies);
    let limit = existingLimit || defaultLimit;
    if (existingLimit && (existingLimit.total !== defaultLimit.total || existingLimit.expire !== defaultLimit.expire)) {
      limit = defaultLimit;
    }

    limit.remaining = Math.max(Number(limit.remaining) - 1, -1);
    const ttl = await this.redisService.getRateLimitTTL(operationName, combineStrategies);
    response.setHeader(CommonConstants.RATE_LIMIT_LIMIT_HEADER, total);
    response.setHeader(CommonConstants.RATE_LIMIT_REMAINING_HEADER, limit.remaining);
    response.setHeader(CommonConstants.RATE_LIMIT_RETRY_AFTER_HEADER, ttl);
    if (limit.remaining === -1) {
      return this.throwExceptionError(context);
    }
    if (ttl === 0) {
      // eslint-disable-next-line consistent-return
      return;
    }
    if (ttl > 0) {
      return this.redisService.setRateLimitEndpoint(operationName, combineStrategies, limit, ttl);
    }
    return this.redisService.setRateLimitEndpoint(operationName, combineStrategies, limit, expire);
  }

  combineStrategies(request: IGqlRequest, strategies: string[]): Promise<string> {
    return strategies.reduceRight(async (prevPromise, current) => {
      const previous = await prevPromise;
      switch (current) {
        case RateLimiterStrategy.USER_ID: {
          const userId = await this.limitbyUserId(request);
          return previous ? `${previous}:${userId}` : userId;
        }
        case RateLimiterStrategy.IP_ADDRESS: {
          const ipAddress = this.limitByIpAddress(request);
          return previous ? `${previous}:${ipAddress}` : ipAddress;
        }
        case RateLimiterStrategy.EMAIL: {
          const email = this.limitByEmail(request);
          return previous ? `${previous}:${email}` : email;
        }
        case RateLimiterStrategy.INGRESS_COOKIE: {
          const ingressCookie = this.limitByIngressCookie(request);
          return previous ? `${previous}:${ingressCookie}` : ingressCookie;
        }
        case RateLimiterStrategy.ANONYMOUS_USER_ID: {
          const anonymousCookie = this.limitByAnonymousUserId(request);
          return previous ? `${previous}:${anonymousCookie}` : anonymousCookie;
        }
        default:
          return previous;
      }
    }, Promise.resolve(''));
  }

  getRequest(context: ExecutionContext) {
    return context.getType() === ContextType.GRAPHQL ? Utils.getGqlRequest(context) : context.switchToHttp().getRequest();
  }

  getResponse(context: ExecutionContext) {
    return context.getType() === ContextType.GRAPHQL ? Utils.getGqlResponse(context) : context.switchToHttp().getResponse();
  }

  throwExceptionError(context: ExecutionContext) {
    throw context.getType() === ContextType.GRAPHQL
      ? GraphErrorException.TooManyRequests('Too many requests')
      : HttpErrorException.TooManyRequests('Too many requests');
  }

  async canActivate(context: ExecutionContext) {
    const startTime = process.hrtime();
    const args = context.getArgs();
    const request = this.getRequest(context);
    if (!request) {
      return false;
    }
    const response = this.getResponse(context);
    if (!response) {
      return false;
    }
    const limiterStrategies = this.reflector.get<string[]>('strategies', context.getHandler());
    if (!limiterStrategies) {
      return false;
    }
    const strategies = await this.combineStrategies(request, limiterStrategies);
    if (!strategies && limiterStrategies[0] === RateLimiterStrategy.INGRESS_COOKIE) {
      return true;
    }
    const operationName = context.getType() === ContextType.GRAPHQL
      ? (OperationMapping[args[3].fieldName] || args[3].fieldName)
      : request.route?.path.substr(1);
    await this.handleCheckRateLimit(context, request, response, operationName, strategies);
    serverTiming.setTiming(request.res, process.hrtime(startTime), 'ratelimit');
    return true;
  }
}
