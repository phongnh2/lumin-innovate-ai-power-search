import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { CommonConstants } from 'Common/constants/CommonConstants';

export const AnonymousUserID = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader || typeof cookieHeader !== 'string') {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const anonymousUserIdCookie = cookies.find((cookie) => cookie.startsWith(`${CommonConstants.ANONYMOUS_USER_ID_COOKIE}=`));

    return anonymousUserIdCookie ? anonymousUserIdCookie.split('=')[1] : undefined;
  },
);
