/* eslint-disable class-methods-use-this */
import produce from 'immer';

import { PLATFORM } from 'screens/OpenLumin/constants';

import indexedDBService from 'services/indexedDBService';

import logger from 'helpers/logger';

import getFileService from 'utils/getFileService';

import { general, images, office } from 'constants/documentType';
import { LOGGER } from 'constants/lumin-common';

import Handler from './Handler';
import { storageHandler } from '..';

const options = {
  mode: 'readwrite',
};
class SystemFileHandler extends Handler {
  getAll = () => indexedDBService.getAllSystemFile();

  get = async (documentId) => {
    const [currentDocument, premiumToolsInfo] = await Promise.all([
      indexedDBService.getSystemFile({
        fileId: documentId,
      }),
      indexedDBService.getPremiumToolsInfo(),
    ]);

    if (currentDocument.platform === PLATFORM.ELECTRON && window.electronAPI) {
      return this.getFileFromElectron({ currentDocument, premiumToolsInfo });
    }

    return { ...currentDocument, premiumToolsInfo };
  };

  getFileFromElectron = async ({ currentDocument, premiumToolsInfo }) => {
    try {
      const fileData = await window.electronAPI.readFile(currentDocument.filePath);
      const file = new File([fileData.data], fileData.name, {
        type: fileData.type,
        lastModified: fileData.lastModified,
      });
      const result = produce(currentDocument, (draft) => {
        draft.file = file;
      });
      return { ...result, premiumToolsInfo };
    } catch (error) {
      throw new Error('Failed to read file', error);
    }
  };

  getStarFiles = () => indexedDBService.getStarSystemFiles();

  insert = async (documents) => {
    const result = await indexedDBService.insertDocuments(documents);
    this.fireEvent(Handler.EVENTS.INSERT_SYSTEM_FILE, result.newDocuments);
    return result;
  };

  update = async (documentId, updatedProps) => {
    const updatedDocument = await indexedDBService.updateSystemFile(documentId, updatedProps);
    this.fireEvent(Handler.EVENTS.UPDATE_SYSTEM_FILE, updatedDocument);
  };

  starFile = async ({ documentId, isStarred }) => {
    const updatedDocument = await indexedDBService.updateSystemFile(documentId, { isStarred });
    this.fireEvent(Handler.EVENTS.CHANGE_STAR_SYSTEM_FILE, updatedDocument);
  };

  delete = (document) => {
    this.fireEvent(Handler.EVENTS.DELETE_SYSTEM_FILE, document._id);
    return Promise.all([
      indexedDBService.deleteSystemFile(document._id),
      storageHandler.deleteFile(`${getFileService.getThumbnailUrl(document.thumbnail)}?v=${document._id}`),
    ]);
  };

  queryPermission = async (fileHandle, opts = options) => (await fileHandle.queryPermission(opts)) === 'granted';

  requestPermission = async (fileHandle, opts = options) => (await fileHandle.requestPermission(opts)) === 'granted';

  preCheckSystemFile = async (fileHandle, opts = options) =>
    (await this.queryPermission(fileHandle, opts)) || this.requestPermission(fileHandle, opts);

  findSystemDocument = async (document) => {
    if (document.platform === 'electron' && document.filePath) {
      return indexedDBService.findElectronSystemDocument(document);
    }

    return indexedDBService.findSystemDocument(document);
  };

  openFilePicker = async () => {
    try {
      return await window.showOpenFilePicker({
        types: [
          {
            description: 'Files',
            accept: {
              [images.PNG]: ['.png'],
              [images.JPEG]: ['.jpeg'],
              [images.JPG]: ['.jpg'],
              [general.PDF]: ['.pdf'],
              [office.DOCX]: ['.docx'],
              [office.XLSX]: ['.xlsx'],
              [office.PPTX]: ['.pptx'],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: true,
      });
    } catch (error) {
      logger.logInfo({
        message: JSON.stringify(error),
        reason: LOGGER.Service.WINDOW_EXCEPTIONS,
      });
    }
  };

  isSystemFile = (documentId) => documentId && documentId.startsWith?.('system');

  isElectronFile = (doc) => doc.platform === 'electron';
}

export default SystemFileHandler;
