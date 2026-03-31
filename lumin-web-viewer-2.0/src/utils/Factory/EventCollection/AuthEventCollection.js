import { AWS_EVENTS } from 'constants/awsEvents';
import { PLAN_TYPE } from 'constants/plan';

import { EventCollection } from './EventCollection';

export class AuthEventCollection extends EventCollection {
  signIn({ method, url, from }) {
    return this.record({
      name: AWS_EVENTS.AUTH.USER_SIGNIN,
      attributes: {
        method,
        url,
        queryString_from: from,
      },
    });
  }

  signUp({ method, userId, planName = PLAN_TYPE.FREE, url, immediate = false, from }) {
    return this.record({
      name: AWS_EVENTS.AUTH.USER_SIGNUP,
      attributes: {
        method,
        LuminUserId: userId,
        planName,
        url,
        queryString_from: from,
      },
      immediate,
    });
  }
}

export default new AuthEventCollection();
