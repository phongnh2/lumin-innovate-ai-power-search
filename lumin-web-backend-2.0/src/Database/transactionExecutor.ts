import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { merge } from 'lodash';
import { TransactionOptions, WithTransactionCallback } from 'mongodb';
import { Connection } from 'mongoose';

import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class TransactionExecutor {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly logger: LoggerService,
  ) {}

  async withTransaction<T>(fn: WithTransactionCallback, context: { fn: string } & T, options?: TransactionOptions) {
    const _opts = merge(options, { writeConcern: { w: 'majority' } });
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(fn, _opts);
      return result;
    } catch (error) {
      this.logger.error({
        context: `${this.withTransaction.name}`,
        error,
        extraInfo: {
          serverSession: session.serverSession,
          context,
        },
      });
      throw error;
    } finally {
      session.endSession();
    }
  }
}
