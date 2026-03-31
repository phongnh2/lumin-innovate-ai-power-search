import { Module, Global } from '@nestjs/common';

import { EnvironmentService } from 'Environment/environment.service';

@Global()
@Module({
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
