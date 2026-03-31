import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

const env = new EnvironmentService();
const redisURL = env.getByKey(EnvConstants.ENV) === 'production'
  ? env.getByKey(EnvConstants.REDIS_ADAPTER_URL)
  : env.getByKey(EnvConstants.REDIS_URL);

export const pubSub = new RedisPubSub({
  publisher: new Redis(redisURL),
  subscriber: new Redis(redisURL),
});
