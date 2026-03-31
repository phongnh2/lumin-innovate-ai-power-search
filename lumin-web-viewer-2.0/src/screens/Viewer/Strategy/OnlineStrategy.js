import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import { isPWAMode } from 'utils/recordUtil';

import ViewerStrategy from './ViewerStrategy';

class OnlineStrategy extends ViewerStrategy {
  constructor(documentId) {
    if (OnlineStrategy.instance) {
      OnlineStrategy.instance.documentId = documentId;
      // eslint-disable-next-line no-constructor-return
      return OnlineStrategy.instance;
    }
    super(documentId);
    OnlineStrategy.instance = this;
    this.documentId = documentId;
  }

  // initialize() {

  // }

  getDocument = () => new Promise(async (resolve, reject) => {
    try {
      const [{ data: { document, getFormField: fields } }, isExistedCacheFile] = await Promise.all([
        documentGraphServices.getDocument({ documentId: this.documentId, usePwa: isPWAMode() }),
        cachingFileHandler.get(this.documentId),
      ]);
      const updatedPermissionOfDocument = { roleOfDocument: document.roleOfDocument, isGuest: false };
      if (document.roleOfDocument === 'guest') {
        updatedPermissionOfDocument.roleOfDocument = document.shareSetting.permission;
        updatedPermissionOfDocument.isGuest = true;
      }
      resolve({
        ...document,
        ...updatedPermissionOfDocument,
        isOfflineValid: Boolean(isExistedCacheFile),
        fields,
      });
    } catch (e) {
      reject(e);
    }
  });

  /**
   * @deprecated will be removed later, we do not use tour document anymore
   */
  get isTourDocument() {
    return this.documentId === process.env.DOCUMENT_TOUR_ID;
  }
}

export default OnlineStrategy;
