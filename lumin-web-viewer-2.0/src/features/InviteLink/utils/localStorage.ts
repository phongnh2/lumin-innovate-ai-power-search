import { LocalStorageKey } from 'constants/localStorageKey';

type HasCloseIntroduceInviteLink = Record<
  string,
  {
    hasClose: boolean;
  }
>;

class LocalStorageHandlers {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  public getFromLocalStorage(): HasCloseIntroduceInviteLink {
    const item = localStorage.getItem(this.key);
    return (item ? JSON.parse(item) : {}) as HasCloseIntroduceInviteLink;
  }

  public setToLocalStorage(payload: HasCloseIntroduceInviteLink): void {
    localStorage.setItem(this.key, JSON.stringify(payload));
  }

  public setCloseStatus(orgId: string): void {
    const data = this.getFromLocalStorage();
    data[orgId] = { hasClose: true };
    this.setToLocalStorage(data);
  }

  public getHasCloseStatus(orgId: string): boolean {
    const data = this.getFromLocalStorage();
    return Boolean(data[orgId]?.hasClose);
  }

  public removeItemByOrg(orgId: string): void {
    const data = this.getFromLocalStorage();
    if (data[orgId]) {
      delete data[orgId];
      this.setToLocalStorage(data);
    }
  }
}

export const inviteLinkSidebarLocalStorage = new LocalStorageHandlers(
  LocalStorageKey.HAS_CLOSED_INVITE_LINK_SIDEBAR_BANNER
);

export const inviteLinkIntroductionPopoverLocalStorage = new LocalStorageHandlers(
  LocalStorageKey.HAS_CLOSED_INTRODUCE_INVITE_LINK_POPOVER
);
