import { v4 } from 'uuid';

import { LocalStorageKey } from 'constants/localStorageKey';

class LocalStorageUtils {
  static remainingKey = [LocalStorageKey.ANONYMOUS_USER_ID];

  // Some key - value should be kept so please use this function instead of `localStorage.clear()`
  static clear = () => {
    const remaining = this.remainingKey.map(key => ({
      key,
      value: this.get({ key })
    }));
    localStorage.clear();
    remaining.forEach(({ key, value }) => {
      if (value) {
        this.set({ key, value });
      }
    });
  };

  static get = ({ key }: { key: string }) => localStorage.getItem(key);

  static set = ({ key, value }: { key: string; value: string }) => localStorage.setItem(key, value);

  static get anonymousUserId() {
    let id = this.get({ key: LocalStorageKey.ANONYMOUS_USER_ID });
    if (!id) {
      id = v4();
      this.set({
        key: LocalStorageKey.ANONYMOUS_USER_ID,
        value: id as string
      });
    }
    return id;
  }
}

export default LocalStorageUtils;
