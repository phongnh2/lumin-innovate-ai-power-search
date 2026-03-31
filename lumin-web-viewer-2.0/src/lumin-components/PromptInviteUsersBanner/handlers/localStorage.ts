import { LocalStorageKey } from 'constants/localStorageKey';
import { PROMPT_INVITE_GOOGLE_USERS_DURATION } from 'constants/urls';

import {
  PromptInviteGoogleUsersStorage,
  ExpirationTimeByOrgProps,
  CloseBannerReason,
} from '../PromptInviteUsersBanner.types';

class LocalStorageHandlers {
  private readonly PROMPT_INVITE_USERS_STORAGE_KEY =
    LocalStorageKey.PROMPT_INVITE_USERS_BANNER_STORAGE_KEY ;

  public getFromLocalStorage(): PromptInviteGoogleUsersStorage {
    const item = localStorage.getItem(this.PROMPT_INVITE_USERS_STORAGE_KEY);
    return (item ? JSON.parse(item) : {}) as PromptInviteGoogleUsersStorage;
  }

  public setToLocalStorage(payload: PromptInviteGoogleUsersStorage): void {
    localStorage.setItem(this.PROMPT_INVITE_USERS_STORAGE_KEY, JSON.stringify(payload));
  }

  public checkExpirationTimeExpired(orgId: string): boolean {
    const expirationTime = this.getExpirationTime(orgId);
    if (!expirationTime) return true;
    return expirationTime < new Date().getTime();
  }

  public getExpirationTime(orgId: string): number {
    const data = this.getFromLocalStorage();
    return data[orgId]?.expirationTime || 0;
  }

  public getDisplayStatus(orgId: string): boolean {
    const data = this.getFromLocalStorage();
    return Boolean(data[orgId]?.show);
  }

  public getCloseBannerReason(orgId: string): CloseBannerReason | undefined {
    const data = this.getFromLocalStorage();
    return data[orgId]?.closeReason;
  }

  public setExpirationTime({ orgId, show, closeReason }: ExpirationTimeByOrgProps): void {
    const data = this.getFromLocalStorage();

    data[orgId] = {
      show,
      closeReason,
      expirationTime: new Date().getTime() + Number(PROMPT_INVITE_GOOGLE_USERS_DURATION),
    };

    this.setToLocalStorage(data);
  }

  public removeExpirationTime(orgId: string): void {
    const data = this.getFromLocalStorage();
    if (data[orgId]) {
      delete data[orgId].expirationTime;
      this.setToLocalStorage(data);
    }
  }

  public removeItemByOrg(orgId: string): void {
    const data = this.getFromLocalStorage();
    if (data[orgId]) {
      delete data[orgId];
      this.setToLocalStorage(data);
    }
  }
}

export default new LocalStorageHandlers();
