import { LocalStorageKey } from 'constants/localStorageKey';

const MAX_DISMISS_COUNT = 3;

type HasVisitedTemplateList = Record<
  string,
  {
    hasVisited: boolean;
    dismissCount: number;
  }
>;

const hashUserId = async (userId: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

class LocalStorageHandlers {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  public getFromLocalStorage(): HasVisitedTemplateList {
    const item = localStorage.getItem(this.key);
    return (item ? JSON.parse(item) : {}) as HasVisitedTemplateList;
  }

  public setToLocalStorage(payload: HasVisitedTemplateList): void {
    localStorage.setItem(this.key, JSON.stringify(payload));
  }

  public async setVisitedStatus(userId: string): Promise<void> {
    const data = this.getFromLocalStorage();
    const hashedUserId = await hashUserId(userId);
    data[hashedUserId] = { hasVisited: true, dismissCount: MAX_DISMISS_COUNT };
    this.setToLocalStorage(data);
  }

  public async getHasVisitedStatus(userId: string): Promise<boolean> {
    const data = this.getFromLocalStorage();
    const hashedUserId = await hashUserId(userId);
    return Boolean(data[hashedUserId]?.hasVisited);
  }

  public async getDismissCount(userId: string): Promise<number> {
    const data = this.getFromLocalStorage();
    const hashedUserId = await hashUserId(userId);
    return data[hashedUserId]?.dismissCount || 0;
  }

  public async incrementDismissCount(userId: string): Promise<void> {
    const data = this.getFromLocalStorage();
    const hashedUserId = await hashUserId(userId);
    data[hashedUserId] = {
      hasVisited: data[hashedUserId]?.hasVisited || false,
      dismissCount: (data[hashedUserId]?.dismissCount || 0) + 1,
    };
    this.setToLocalStorage(data);
  }
}

export const promoteTemplatesLocalStorage = new LocalStorageHandlers(LocalStorageKey.PROMOTE_TEMPLATES);
