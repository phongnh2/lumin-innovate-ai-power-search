import { DynamicModule, Module } from '@nestjs/common';

import { createCallbackProviders } from 'Calback/callback.provider';
import { CallbackService } from 'Calback/callback.service';

@Module({})
export class CallbackModule {
  static forRoot(): DynamicModule {
    const callbacksProviders = createCallbackProviders();
    return {
      global: true,
      module: CallbackModule,
      providers: [CallbackService, ...callbacksProviders],
      exports: [CallbackService, ...callbacksProviders],
    };
  }
}
