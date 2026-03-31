import { RedisConstants } from 'Common/callbacks/RedisConstants';

import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';

export class ContactPool {
  private POOL_SIZE: number;

  constructor(
    private readonly poolSize: number,
    private readonly redisService: RedisService,
    private readonly loggerService: LoggerService,
  ) {
    this.POOL_SIZE = this.poolSize || 50;
    this.redisService = redisService;
  }

  public async pushToPool(contact): Promise<void> {
    return this.redisService.pushToPool(contact);
  }

  public async dispatchPoolAction(fn): Promise<void> {
    const len = await this.redisService.getHashLength(RedisConstants.CONTACT_POOL);
    if (len < this.POOL_SIZE) {
      return;
    }
    const pool = await this.redisService.getContactPool();
    const emails = pool.map((contact) => contact.email).filter(Boolean);
    if (!emails.length) {
      this.loggerService.debug('No emails found in pool', {
        context: 'ContactPool',
        extraInfo: {
          emails,
          pool,
          len,
        },
      });
    }
    this.redisService.deleteHashFields(RedisConstants.CONTACT_POOL, emails);
    fn(pool);
  }
}
