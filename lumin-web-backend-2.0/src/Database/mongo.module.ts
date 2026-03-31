import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvConstants } from 'Common/constants/EnvConstants';
// import { Options } from 'Common/utils/Options';

import { TransactionExecutor } from 'Database/transactionExecutor';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerModule } from 'Logger/Logger.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule, LoggerModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => ({
        // ...Options.getOptions().mongoDB(),
        uri: environmentService.getByKey(EnvConstants.MONGO_URL),
        useNewUrlParser: true,
      }),
    }),
  ],
  providers: [TransactionExecutor],
  exports: [TransactionExecutor],
})

export class MongoModule { }
