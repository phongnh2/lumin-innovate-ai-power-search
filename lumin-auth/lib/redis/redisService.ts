import { createClient, RedisClientType } from '@redis/client';

import { environment } from '@/configs/environment';
import { LOGGER_SCOPE } from '@/constants/logger';

import { logger } from '../logger';

class RedisService {
  private redis: RedisClientType;

  async startConnection() {
    this.redis = (await createClient({ url: environment.internal.redis.url })
      .on('connect', () => {
        logger.info({
          message: 'Connected to redis'
        });
      })
      .on('err', err =>
        logger.error({
          err,
          message: 'Error connecting to redis',
          scope: LOGGER_SCOPE.REDIS_CONNECTION
        })
      )
      .connect()) as RedisClientType;
  }

  constructor() {
    this.startConnection();
  }

  get isReady() {
    return this.redis?.isReady;
  }

  public async increaseAndGet(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  public async setExpire(key: string, timestamp: number | Date): Promise<boolean> {
    return this.redis.expireAt(key, timestamp);
  }
}

const redisService = new RedisService();

export default redisService;
