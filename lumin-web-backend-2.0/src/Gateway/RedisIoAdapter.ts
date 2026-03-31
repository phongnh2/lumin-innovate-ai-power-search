/* eslint-disable import/no-extraneous-dependencies */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from '@redis/client';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

const env = new EnvironmentService();
const redisAdapterUrl = env.getByKey(EnvConstants.ENV) === 'production'
  ? env.getByKey(EnvConstants.REDIS_ADAPTER_URL)
  : env.getByKey(EnvConstants.REDIS_URL);

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: redisAdapterUrl });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (error) => console.log(JSON.stringify({ context: 'redis_pub_client_error', error, level: 'error' })));
    subClient.on('error', (error) => console.log(JSON.stringify({ context: 'redis_sub_client_error', error, level: 'error' })));

    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
