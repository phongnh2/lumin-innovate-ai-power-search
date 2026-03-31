/* eslint-disable class-methods-use-this */
import { v4 } from 'uuid';

import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import documentServices from 'services/documentServices';
import { documentGraphServices } from 'services/graphServices';
import indexedDBService from 'services/indexedDBService';

import fileUtil from 'utils/file';
import getFileService from 'utils/getFileService';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { OFFLINE_STORAGE_ACTION, OFFLINE_STATUS } from 'constants/offlineConstant';
import { SOCKET_EMIT } from 'constants/socketConstant';

import Handler from './Handler';
import { socket } from '../../../socket';

// eslint-disable-next-line max-len
const templateUnq = '<stamp page="luminPageNumber" rect="0,792,0,792" color="#000000" flags="hidden,print,readonly" name="luminUnqId" subject="LUnique" date="D:20211005115246+07\'00\'" creationdate="D:20211005115246+07\'00\'"><trn-custom-data bytes="{&quot;trn-annot-type&quot;:&quot;lunique&quot;,&quot;trn-annot-data&quot;:{}}"/><imagedata>data:,</imagedata></stamp>';

const SOURCE_CHECK_DELAY = 2000;

class CachingFileHandler extends Handler {
  constructor(mediator) {
    super(mediator);
    this.data = [];
    this.subWorkerHandler = [];
  }

  initialize = async (currentUser) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this._messageHandler);
      const userActive = await this.getActiveOfflineUser();
      if (currentUser?.email === userActive.email) {
        Handler.isOfflineEnabled = true;
        indexedDBService.setCurrentUser(currentUser);
        const data = await this.getAll();
        this.data = data.map((document) => ({ ...document, offlineStatus: DOCUMENT_OFFLINE_STATUS.AVAILABLE }));
        setTimeout(() => this.mediator.notify(Handler.EVENTS.UPDATE_SOURCE), SOURCE_CHECK_DELAY);
      } else {
        Handler.isOfflineEnabled = false;
        this.data = [];
      }
    }
  };

  uninitialize() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this._messageHandler);
    }
  }

  subServiceWorkerHandler = (handler) => {
    this.subWorkerHandler.push(handler);
  };

  unSubServiceWorkerHandler = (handler) => {
    const index = this.subWorkerHandler.findIndex((workerHandler) => workerHandler === handler);
    if (index !== -1) {
      this.subWorkerHandler.splice(index, 1);
    }
  };

  _messageHandler = (evt) => {
    const { process = {}, ...rest } = evt.data;
    if (process.success) {
      if (process.status === OFFLINE_STATUS.OK) {
        if (process.action === OFFLINE_STORAGE_ACTION.CLEAN_SOURCE) {
          Handler.isOfflineEnabled = false;
          this.data = [];
        } else {
          Handler.isOfflineEnabled = true;
        }
        store.dispatch(actions.setSourceDownloading(false));
      } else if (process.status === OFFLINE_STATUS.DOWNLOADING) {
        store.dispatch(actions.setSourceDownloading(true));
      }
    }
    this.subWorkerHandler.forEach((handler) => handler({ ...rest, process }));
  };

  onStartDownload = (document) => {
    this.data.push({ ...document, offlineStatus: DOCUMENT_OFFLINE_STATUS.DOWNLOADING });
    this.fireEvent(Handler.EVENTS.STARTING_DOWNLOAD, document);
  };

  onDownloadFailed = (documentId) => {
    const deletedIdx = this.data.map((document) => document._id).indexOf(documentId);
    if (deletedIdx !== -1) {
      this.data.splice(deletedIdx, 1);
    }
    this.fireEvent(Handler.EVENTS.DOWNLOAD_FAILED, documentId);
  };

  onFinishDownload = (documentId) => {
    const updatedIdx = this.data.map((document) => document._id).indexOf(documentId);
    this.data[updatedIdx].offlineStatus = DOCUMENT_OFFLINE_STATUS.AVAILABLE;
    this.fireEvent(Handler.EVENTS.FINISHED_DOWNLOAD, documentId);
  };

  get = (documentId) => indexedDBService.getCachingFile(documentId);

  getAll = () => indexedDBService.getAllCachingFile();

  getAllStatus = () => {
    const status = {};
    this.data.forEach(({ _id, offlineStatus }) => { status[_id] = offlineStatus; });
    return status;
  };

  convertCachedFileToBlob = async (cachedUrl) => {
    const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
    const cachedData = await fileCache.match(cachedUrl);
    return cachedData.clone().blob();
  };

  delete = async (documentId) => {
    this.fireEvent(Handler.EVENTS.DELETE_CACHING_FILE, documentId);
    const deletedIdx = this.data.map((document) => document._id).indexOf(documentId);
    if (deletedIdx !== -1) {
      this.data.splice(deletedIdx, 1);
    }
    const cachedDocument = await this.get(documentId);
    if (!cachedDocument) {
      return null;
    }
    const { signedUrl, thumbnail, imageSignedUrls } = cachedDocument;
    await indexedDBService.deleteCachingFile(documentId);
    this.mediator.notify(Handler.EVENTS.DELETE_CACHING_FILE, {
      documentId,
      signedUrl,
      thumbnail: `${getFileService.getThumbnailUrl(thumbnail)}?v=${documentId}`,
      imageSignedUrls: Object.values(imageSignedUrls ?? {}),
    });
    return cachedDocument;
  };

  download = async (documentData) => {
    const documentId = documentData._id;
    this.onStartDownload(documentData);
    const downloadedDocument = await documentServices.downloadDocument(documentId);
    // TODO: Need to verify getting annotations
    const [newAnnotations, fields] = await Promise.all([
      documentServices.getAnnotations({ documentId: downloadedDocument._id }),
      documentGraphServices.getFormFields(downloadedDocument._id),
    ]);
    const documentWithAnnotData = { ...downloadedDocument, newAnnotations, fields };
    const { data: { cachedFile } } = await this.mediator.notify(Handler.EVENTS.DOWNLOAD_FILE, {
      signedUrl: downloadedDocument.signedUrl,
      thumbnail: `${getFileService.getThumbnailUrl(downloadedDocument.thumbnail)}?v=${documentId}`,
    });
    this.mediator.notify(Handler.EVENTS.DOWNLOAD_IMAGE_FOR_ANNOT, {
      imageSignedUrls: Object.values(downloadedDocument.imageSignedUrls),
    });

    await core.loadFullApi();
    const fileBlob = await cachedFile.clone().blob();
    const fileWithName = new File([fileBlob], downloadedDocument.name, { type: fileBlob.type });
    const url = window.URL.createObjectURL(new Blob([fileBlob]));
    const docIns = await fileUtil.getDocumentInstanceWithFile(url, fileWithName, store.dispatch);
    const doc = await docIns.getPDFDoc();
    await doc.initSecurityHandler();
    await doc.removeSecurity();
    const fdf = await doc.fdfExtract(window.Core.PDFNet.PDFDoc.ExtractFlag.e_annots_only);
    const xfdfString = await fdf.saveAsXFDFAsString();
    const annotInjectedDocument = await this.transformAnnotation({
      document: documentWithAnnotData, xfdfString, doc, documentId,
    });
    indexedDBService.insertCachingFile(annotInjectedDocument);
    this.onFinishDownload(documentId);
    URL.revokeObjectURL(url);
    doc.destroy();
  };

  transformAnnotation = async ({
    xfdfString, document, documentId, doc,
  }) => {
    const isIncludeUnqPageId = document.newAnnotations.find(({ xfdf }) => xfdf.includes('subject="LUnique"'));
    if (!isIncludeUnqPageId && !xfdfString.includes('subject="LUnique"')) {
      const totalPage = await doc.getPageCount();
      const { unqXfdf, unqId } = this._addUniqueFlagForEachPage(documentId, { totalPage, addToAllPage: true });
      return { ...document, newAnnotations: [...document.newAnnotations, { xfdf: unqXfdf, annotationId: unqId }] };
    }
    return document;
  };

  cachingDocument = async (document, { includeUnqPageId, pages } = {}) => {
    const { newAnnotations } = document;
    this.onStartDownload(document);
    this.mediator.notify(Handler.EVENTS.DOWNLOAD_FILE, {
      signedUrl: document.signedUrl,
      thumbnail: `${getFileService.getThumbnailUrl(document.thumbnail)}?v=${document._id}`,
      imageSignedUrls: document.imageSignedUrls,
    });
    if (includeUnqPageId) {
      const { unqXfdf, unqId } = this._addUniqueFlagForEachPage(document._id, { pages });
      newAnnotations.push({ xfdf: unqXfdf, annotationId: unqId });
    }
    indexedDBService.insertCachingFile({
      ...document,
      newAnnotations,
    });
    this.onFinishDownload(document._id);
  };

  update = async (newDocumentData, {
    includeUnqPageId,
    pages,
    shouldUpdateCachedFile = false,
    shouldOverwriteImageSignUrls = false,
    newAnnotations = [],
    newManipulations = [],
    newFields = [],
  } = {}) => {
    const document = await this.get(newDocumentData._id);
    if (!document) {
      return;
    }
    let updatedSignedUrl = document.signedUrl;
    if (shouldUpdateCachedFile && newDocumentData.version !== document.version) {
      updatedSignedUrl = newDocumentData.signedUrl;
      this.mediator.notify(Handler.EVENTS.UPDATE_CACHING_FILE,
        {
          documentId: newDocumentData._id,
          oldSignedUrl: document.signedUrl,
          newSignedUrl: newDocumentData.signedUrl,
        });
    }
    if (includeUnqPageId) {
      const { unqXfdf, unqId } = this._addUniqueFlagForEachPage(document._id, { pages });
      newAnnotations.push({ xfdf: unqXfdf, annotationId: unqId });
    }
    const newImageSignedUrls = {};
    let imageSignedUrls;
    if (newDocumentData.imageSignedUrls) {
      if (shouldOverwriteImageSignUrls) {
        Object.entries(newDocumentData.imageSignedUrls).forEach(([remoteId, newSignedUrl]) => {
          if (!document.imageSignedUrls[remoteId]) {
            newImageSignedUrls[remoteId] = newSignedUrl;
          }
        });
        this.mediator.notify(Handler.EVENTS.DOWNLOAD_IMAGE_FOR_ANNOT, {
          imageSignedUrls: Object.values(newImageSignedUrls),
        });
        imageSignedUrls = { ...document.imageSignedUrls, ...newImageSignedUrls };
      } else {
        imageSignedUrls = newDocumentData.imageSignedUrls;
      }
    }
    const newDocumentAnnotations = newDocumentData.newAnnotations || [];
    const oldManipulationSteps = newDocumentData.manipulationStep ? JSON.parse(newDocumentData.manipulationStep) : [];
    const oldFields = newDocumentData.fields || [];
    indexedDBService.insertCachingFile({
      ...document,
      ...newDocumentData,
      signedUrl: updatedSignedUrl,
      imageSignedUrls,
      newAnnotations: [...newDocumentAnnotations, ...newAnnotations],
      manipulationStep: JSON.stringify([...oldManipulationSteps, ...newManipulations]),
      fields: [...oldFields, ...newFields],
    });
  };

  updateDocumentPropertyById = async (documentId, { addedAnnotation }) => {
    const document = await this.get(documentId);
    indexedDBService.insertCachingFile({
      ...document,
      newAnnotations: [...document.newAnnotations, addedAnnotation],
    });
  };

  updateDocumentBookmarkInCachingFileById = async (documentId, bookmarks) => {
    const document = await this.get(documentId);
    const updateBookmarks = bookmarks.length ? JSON.stringify(bookmarks) : null;
    indexedDBService.insertCachingFile({ ...document, bookmarks: updateBookmarks });
  };

  updateDocumentImageUrlById = async (documentId, { signedUrl, remoteId }) => {
    const document = await this.get(documentId);
    if (!document.imageSignedUrls[remoteId]) {
      this.mediator.notify(Handler.EVENTS.DOWNLOAD_IMAGE_FOR_ANNOT, {
        imageSignedUrls: [signedUrl],
      });
      indexedDBService.insertCachingFile({
        ...document,
        imageSignedUrls: { ...document.imageSignedUrls, [remoteId]: signedUrl },
      });
    }
  };

  deleteDocumentImageUrlById = async (documentId, remoteIds) => {
    const document = await this.get(documentId);
    const deletedImageRemoteIds = document.deletedImageRemoteIds ?? [];
    deletedImageRemoteIds.push(...remoteIds);
    const listDeletedImagesUrl = remoteIds.map((remoteId) => document.imageSignedUrls[remoteId]);
    this.mediator.notify(Handler.EVENTS.DELETE_IMAGES, {
      deletedImages: listDeletedImagesUrl,
    });
    indexedDBService.insertCachingFile({
      ...document,
      deletedImageRemoteIds: Array.from(new Set(deletedImageRemoteIds)),
    });
  };

  getActiveOfflineUser = () => indexedDBService.getAccountEnabledOffline();

  isOfflineProcessing = () => indexedDBService.isOfflineInstallProcessing();

  getCurrentOfflineVersion = () => indexedDBService.getCurrentOfflineVersion();

  shouldManualUpdate = () => indexedDBService.shouldManualUpdate();

  _addUniqueFlagForEachPage = (documentId, { pages = [], addToAllPage = false, totalPage = 0 }) => {
    const state = store.getState();
    const currentUser = selectors.getCurrentUser(state) || {};
    const xfdfList = [];
    if (addToAllPage) {
      for (let index = 0; index < totalPage; index++) {
        const mapObj = {
          luminPageNumber: index,
          luminUnqId: `LUnique-${v4()}`,
        };
        xfdfList.push(templateUnq.replace(/luminPageNumber|luminUnqId/gi, (matched) => mapObj[matched]));
      }
    } else {
      pages.forEach((page) => {
        const mapObj = {
          luminPageNumber: page,
          luminUnqId: `LUnique-${v4()}`,
        };
        xfdfList.push(templateUnq.replace(/luminPageNumber|luminUnqId/gi, (matched) => mapObj[matched]));
      });
    }
    const unqXfdf = `<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<add>${xfdfList.join('')}</add>\n<modify />\n<delete />\n</xfdf>`;
    const unqId = `LUnique-${v4()}`;
    const xfdfData = {
      annotationAction: 'modify',
      annotationType: 'Index',
      email: currentUser.email,
      roomId: documentId,
      xfdf: unqXfdf,
      annotationId: unqId,
      shouldCreateEvent: false,
    };
    socket.emit(SOCKET_EMIT.ANNOTATION_CHANGE, xfdfData);
    if (window.location.pathname.startsWith('/viewer/')) {
      core.getAnnotationManager().importAnnotationCommand(unqXfdf);
    }
    return { unqXfdf, unqId };
  };

  isSourceDownloadSuccess = (process = {}) =>
    process.success && process.action === OFFLINE_STORAGE_ACTION.SOURCE_CACHING && process.status === OFFLINE_STATUS.OK;

  isCleanSourceSuccess = (process = {}) =>
    process.success && process.action === OFFLINE_STORAGE_ACTION.CLEAN_SOURCE && process.status === OFFLINE_STATUS.OK;
}

export default CachingFileHandler;
