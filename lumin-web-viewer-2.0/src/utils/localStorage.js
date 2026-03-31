import dayjs from 'dayjs';
import v4 from 'uuid/v4';

import { LocalStorageKey } from 'constants/localStorageKey';
import { PROMOTE_TEMPLATES_EXPIRY } from 'constants/urls';

class LocalStorageUtils {
  static remainingKey = [
    LocalStorageKey.ANONYMOUS_USER_ID,
    LocalStorageKey.HAS_SHOWN_DISMISS_FREE_TRIAL_SURVEY,
    LocalStorageKey.HAS_CLOSED_WORKSPACE_ANNOUNCEMENT,
    LocalStorageKey.EXPLORE_FEATURES_GUEST_MODE_FLP,
    LocalStorageKey.SHOW_AGREEMENT_GEN_INPUT_BOX,
    LocalStorageKey.SHOW_AGREEMENT_GEN_SURVEY,
  ];

  static clear = () => {
    const remaining = this.remainingKey.map((key) => ({
      key,
      value: this.get({ key }),
    }));
    const isPromoteTemplatesExpired = dayjs().isAfter(dayjs(PROMOTE_TEMPLATES_EXPIRY));

    if (!isPromoteTemplatesExpired) {
      const templateListValue = this.get({ key: LocalStorageKey.PROMOTE_TEMPLATES });
      if (templateListValue) {
        remaining.push({
          key: LocalStorageKey.PROMOTE_TEMPLATES,
          value: templateListValue,
        });
      }
    }

    localStorage.clear();

    remaining.forEach(({ key, value }) => {
      if (value) {
        this.set({ key, value });
      }
    });
  };

  static get = ({ key }) => localStorage.getItem(key);

  static set = ({ key, value }) => localStorage.setItem(key, value);

  static get anonymousUserId() {
    let id = this.get({ key: LocalStorageKey.ANONYMOUS_USER_ID });
    if (!id) {
      id = v4();
      this.set({
        key: LocalStorageKey.ANONYMOUS_USER_ID,
        value: id,
      });
    }
    return id;
  }
}

export default LocalStorageUtils;