import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';

import { AsymmetricJwtService } from './asymmetric-jwt.service';

@Module({
  imports: [EnvironmentModule,
  ],
  providers: [AsymmetricJwtService],
  exports: [AsymmetricJwtService],
})
export class AsymmetricJwtModule {}
