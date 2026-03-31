import { createParamDecorator } from 'next-api-decorators';

import type { Identity } from '@/interfaces/ory';
import { frontendApi } from '@/lib/ory';

export const IdentityDecorator = createParamDecorator<Promise<Identity | undefined>>(async req => {
  const cookie = req.headers.cookie ?? '';
  const { data: session } = await frontendApi.toSession({ cookie });
  return session.identity;
});
