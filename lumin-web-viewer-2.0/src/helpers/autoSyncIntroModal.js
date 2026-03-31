import dayjs from 'dayjs';
import { LocalStorageKey } from 'constants/localStorageKey';

const AUTO_SYNC_INTRODUCE_DATE = '2022-04-12';

const autoSyncIntroduceDate = dayjs(AUTO_SYNC_INTRODUCE_DATE);

export const isNewUser = (user) => {
  if (!user) {
    return false;
  }
  const userCreatedDate = dayjs(user.createdAt.substr(0, 10));
  return autoSyncIntroduceDate.isBefore(userCreatedDate);
};

export const has3DocsOpened = () => {
  const openedDocIds = JSON.parse(localStorage.getItem(LocalStorageKey.OPENED_DOCUMENTS)) || [];
  return openedDocIds.length >= 3;
};

export const isUserNotShownModal = (user) => !user.metadata?.hasShownAutoSyncModal;

export const saveOpenedDocIds = (docId) => {
  const openedDocIds = JSON.parse(localStorage.getItem(LocalStorageKey.OPENED_DOCUMENTS)) || [];
  if (!openedDocIds.includes(docId)) {
    openedDocIds.push(docId);
    localStorage.setItem(LocalStorageKey.OPENED_DOCUMENTS, JSON.stringify(openedDocIds));
  }
};
