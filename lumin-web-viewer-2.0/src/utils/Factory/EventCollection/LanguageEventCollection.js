import UserEventConstants from 'constants/eventConstants';

import { EventCollection } from './EventCollection';

export class LanguageEventCollection extends EventCollection {
  switchLanguage({ preferredLanguage }) {
    return this.record({
      name: UserEventConstants.EventType.SWITCH_LANGUAGE,
      attributes: {
        preferredLanguage,
      },
      immediate: true,
    });
  }
}

export default new LanguageEventCollection();
