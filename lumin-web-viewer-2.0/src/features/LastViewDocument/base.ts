import { LocalStorageKey } from 'constants/localStorageKey';

import { ILastViewDocument } from './interface';
import { StorageHandler } from './storageHandler';

export class LastViewDocumentHandler {
  private storageKey = LocalStorageKey.LAST_VIEW_DOCUMENT;

  private storage: StorageHandler<ILastViewDocument>;

  constructor() {
    this.storage = new StorageHandler({
      storageKey: this.storageKey,
    });
  }

  add(documentId: string, pageNumber: number) {
    this.storage.add({ documentId, pageNumber }, 'documentId');
  }

  getTotal() {
    return this.storage.getAll()?.length;
  }

  get(documentId: string) {
    const items = this.storage.getAll();
    if (!items) {
      return null;
    }

    return items.find((item) => item.documentId === documentId);
  }

  getPageNumber({ documentId, totalPage }: { documentId: string; totalPage: number }) {
    const lastPage = this.get(documentId)?.pageNumber;
    if (!lastPage || lastPage < 1) {
      return 1;
    }
    return Math.min(lastPage, totalPage);
  }
}

export default new LastViewDocumentHandler();
