/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Provider } from '@nestjs/common';

import { scopesCallback } from 'Calback/callback.decorator';
import { CallbackService } from 'Calback/callback.service';

function callbackFactory(callback: CallbackService, scope: string) {
  if (callback) {
    callback.setScope(scope);
  }
  return callback;
}

function createCallbackProvider(scope: string): Provider<CallbackService> {
  return {
    provide: `${scope}CallbackService`,
    useFactory: (callback) => callbackFactory(callback, scope),
    inject: [CallbackService],
  };
}

export function createCallbackProviders(): Array<Provider<CallbackService>> {
  return scopesCallback.map((callback) => createCallbackProvider(callback));
}
