import { Global, Module } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';
import { LoggerService } from 'Logger/Logger.service';

@Global()
@Module({
  imports: [EnvironmentModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule { }
