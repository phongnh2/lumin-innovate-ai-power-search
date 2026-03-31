import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction, createMiddlewareDecorator } from 'next-api-decorators';

import { DEFAULT_LIMIT, RATE_LIMIT_REDIS_PREFIX } from '@/constants/rateLimit';
import redisService from '@/lib/redis/redisService';
import { getIpAddress } from '@/utils/network.utils';

export default createMiddlewareDecorator(async (request: NextApiRequest, response: NextApiResponse, next: NextFunction): Promise<void> => {
  if (!redisService.isReady) {
    // Temporary bypass
    return next();
  }

  const ipAddress = getIpAddress(request);
  const endpoint = request.url as string;
  const currentWindow = new Date();

  // Fixed window with each window range from start to end of an hour
  currentWindow.setMinutes(0);
  currentWindow.setSeconds(0);
  currentWindow.setMilliseconds(0);

  const nextWindow = new Date(currentWindow);
  nextWindow.setHours(currentWindow.getHours() + 1);

  const key = `${RATE_LIMIT_REDIS_PREFIX}${currentWindow.getTime()}:${ipAddress}:${endpoint}`;
  const total = await redisService.increaseAndGet(key);
  if (total === 1) {
    await redisService.setExpire(key, nextWindow);
  }
  const limit = DEFAULT_LIMIT;
  const remaining = Math.max(limit - total, 0);

  response.setHeader('X-RateLimit-Limit', limit);
  response.setHeader('X-RateLimit-Remaining', remaining);
  response.setHeader('X-RateLimit-Reset', nextWindow.getTime());

  if (!remaining && total !== limit) {
    return response.status(429).json({
      code: 'TOO_MANY_REQUEST',
      message: 'Your requests reached the limit. Try again later.'
    });
  }
  next();
});
