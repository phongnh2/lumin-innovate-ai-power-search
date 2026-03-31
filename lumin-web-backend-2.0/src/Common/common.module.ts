import { Module } from '@nestjs/common';

import { DateScalar } from 'Common/scalars/Date';
import { StringOrIntScalar } from 'Common/scalars/StringOrInt';

import { AsymmetricJwtModule } from 'Asymmetric/asymmetric-jwt.module';
import { LoggerModule } from 'Logger/Logger.module';

@Module({
  imports: [LoggerModule, AsymmetricJwtModule],
  providers: [DateScalar, StringOrIntScalar],
})
export class CommonModule {}
