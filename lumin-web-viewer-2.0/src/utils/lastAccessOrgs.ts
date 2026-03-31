/* eslint-disable class-methods-use-this */
import { LocalStorageKey } from 'constants/localStorageKey';
import { MAX_ACCESS_ORG_DISPLAY } from 'constants/organizationConstants';

class LastAccessOrgs {
  getFromStorage(): { id: string; url: string }[] {
    return JSON.parse(localStorage.getItem(LocalStorageKey.LAST_ACCESS_ORG_LIST) || '[]') as {
      id: string;
      url: string;
    }[];
  }

  getOrgUrlList() {
    const orgList = this.getFromStorage();

    /**
     * Ensure compatibility with the older format.
     * The older implementation stored `orgList` as an array of `orgUrl`.
     */
    if (typeof orgList[0] === 'string') {
      return orgList;
    }
    return orgList.map(({ url }) => url);
  }

  setToStorage({ id, url }: { id: string; url: string }) {
    const orgList = this.getFromStorage().filter(({ url: orgUrl }) => orgUrl !== url);
    const lastAccessOrgList = Array.from(new Set([{ id, url }, ...orgList])).slice(0, MAX_ACCESS_ORG_DISPLAY);
    localStorage.setItem(LocalStorageKey.LAST_ACCESS_ORG_LIST, JSON.stringify(lastAccessOrgList));
  }

  setOrgUrlsToStorage(orgs: { id: string; url: string }[]) {
    localStorage.setItem(LocalStorageKey.LAST_ACCESS_ORG_LIST, JSON.stringify(orgs));
  }

  removeByOrgUrl(orgUrl: string) {
    const orgs = this.getFromStorage();
    localStorage.setItem(
      LocalStorageKey.LAST_ACCESS_ORG_LIST,
      JSON.stringify(orgs.filter(({ url }) => url !== orgUrl))
    );
  }
}

export default new LastAccessOrgs();
