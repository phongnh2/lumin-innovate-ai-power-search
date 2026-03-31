import { Inject } from '@nestjs/common';

export const scopesCallback: string[] = new Array<string>();

export const Callback = (scope: string): any => {
  if (scope && !scopesCallback.includes(scope)) {
    scopesCallback.push(scope);
  }

  return Inject(`${scope}CallbackService`);
};
