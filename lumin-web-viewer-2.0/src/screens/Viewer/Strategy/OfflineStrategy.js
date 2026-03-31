import { cachingFileHandler, systemFileHandler } from 'HOC/OfflineStorageHOC';

import { indexedDBService } from 'services';

import logger from 'helpers/logger';

import { OPENED_BY, ACCOUNTABLE_BY, DocumentFromSourceEnum } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import { STORAGE_TYPE } from 'constants/lumin-common';

import ViewerStrategy from './ViewerStrategy';

class OfflineStrategy extends ViewerStrategy {
  constructor(documentId) {
    if (OfflineStrategy.instance) {
      OfflineStrategy.instance.documentId = documentId;
      OfflineStrategy.instance.isSystemFile = systemFileHandler.isSystemFile(documentId);
      // eslint-disable-next-line no-constructor-return
      return OfflineStrategy.instance;
    }
    super(documentId);
    OfflineStrategy.instance = this;
    this.documentId = documentId;
    this.isSystemFile = systemFileHandler.isSystemFile(documentId);
  }

  getDocument = async () => {
    const cloudData = await cachingFileHandler.get(this.documentId);
    if (!cloudData) {
      throw new Error('offline_file_not_found');
    }
    const fileBlob = await cachingFileHandler.convertCachedFileToBlob(cloudData.signedUrl);
    let { premiumToolsInfo } = cloudData;
    if (!premiumToolsInfo) {
      premiumToolsInfo = (await indexedDBService.getPremiumToolsInfo()) || {};
    }
    return {
      documentStatus: {
        openedBy: OPENED_BY.OTHER,
        accountableBy: ACCOUNTABLE_BY.PERSONAL,
        targetId: '',
      },
      shareSetting: {
        permission: 'OWNER',
      },
      premiumToolsInfo,
      ...cloudData,
      file: fileBlob,
      service: STORAGE_TYPE.CACHING,
      isOfflineValid: true,
    };
  };

  getSystemDocument = async () => {
    try {
      const systemFile = await systemFileHandler.get(this.documentId);

      return {
        fromSource: DocumentFromSourceEnum.USER_UPLOAD,
        metadata: {},
        ...systemFile,
        documentStatus: {
          openedBy: OPENED_BY.OTHER,
          accountableBy: ACCOUNTABLE_BY.PERSONAL,
          targetId: '',
        },
        shareSetting: {
          permission: 'OWNER',
        },
        unsaved: false,
        isOfflineValid: true,
      };
    } catch (e) {
      logger.logError({
        error: e,
        context: this.getSystemDocument.name,
        message: e instanceof Error ? e.message : 'Unknown error',
      });
      if (e.message === 'Not allowed to open file') {
        throw new Error(ErrorCode.Document.SYSTEM_FILE_OPEN_ERROR);
      }
      throw new Error(ErrorCode.Document.SYSTEM_FILE_DELETED);
    }
  };
}

export default OfflineStrategy;
