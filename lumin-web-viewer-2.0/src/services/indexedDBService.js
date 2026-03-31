/// <reference path="./indexedDBService.d.ts" />

import { deleteDB, wrap } from 'idb';
import { produce } from 'immer';

import { PLATFORM } from 'screens/OpenLumin/constants';

import toastUtils from 'utils/toastUtils';

import { INDEXED_DB_VERSION } from 'constants/indexedDbVersion';
import { LOGGER } from 'constants/lumin-common';

import { findFileEntry } from './localFileServices';
import logger from '../helpers/logger';

const MAX_DOCUMENT_STORED = 20;
const database = {
  name: 'LuminDocs',
};

export const INDEXED_DB_TABLES = {
  SYSTEM_DOCUMENTS: 'DocumentSystems',
  INFO: 'ProfileData',
  CLOUD_DOCUMENTS: 'DocumentClouds',
  DOCUMENTS_CACHING: 'DocumentCaches',
  DOCUMENT_COMMANDS: 'DocumentCommands',
  DOCUMENT_OFFLINE_TRACKING_EVENTS: 'DocumentOfflineTrackingEvents',
  DOCUMENT_TEMP_COMMANDS: 'DocumentTempCommands',
  FREQUENTLY_USED_DOCUMENTS_CACHING: 'FrequentlyUsedDocumentCaches',
  FORM_FIELD_SUGGESTIONS: 'FormFieldSuggestions',
  TEMP_EDIT_MODE_FILE_CHANGED: 'TempEditModeFileChanged',
  AUTO_DETECT_FORM_FIELDS: 'AutoDetectFormFields',
  GUEST_MODE_MANIPULATE_DOCUMENTS: 'GuestModeManipulateDocuments',
};

function getIndexedDBInstance() {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
}

function canUseIndexedDB() {
  const instance = getIndexedDBInstance();
  return !!instance;
}

const indexedDBPolyfill = {
  open: () => {},
  get: () => {},
  getAll: () => {},
  put: () => {},
  delete: () => {},
  clear: () => {},
  count: () => {},
  transaction: () => {},
};

const ERROR_MESSAGE_TIME_OUT = 1000;

const onUpgrade = (db) => {
  Object.values(INDEXED_DB_TABLES).forEach((value) => {
    if (!db.objectStoreNames.contains(value)) {
      [
        INDEXED_DB_TABLES.INFO,
        INDEXED_DB_TABLES.DOCUMENT_OFFLINE_TRACKING_EVENTS,
        INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS,
        INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED,
        INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS,
      ].includes(value)
        ? db.createObjectStore(value)
        : db.createObjectStore(value, { keyPath: '_id' });
    }
  });
};
let blockedTimeout = null;
const openDbWithConfig = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(database.name, INDEXED_DB_VERSION);
    req.onupgradeneeded = () => {
      clearTimeout(blockedTimeout);
      onUpgrade(req.result);
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      db.onversionchange = () => {
        db.close();
      };
      resolve(req.result);
    };
    req.onblocked = () => {
      blockedTimeout = setTimeout(() => {
        toastUtils.error({
          message: 'Something went wrong. Please close other tabs displaying this site.',
        });
      }, ERROR_MESSAGE_TIME_OUT);
    };
    req.addEventListener('error', (event) => {
      reject(event.target.error);
    });
  });

const handleOpenDbError = async (err) => {
  /**
   * Need to handle this case when reverting production code cause user version is higher than the current version
   */
  if (err.name === 'VersionError') {
    await deleteDB(database.name);
    return wrap(await openDbWithConfig());
  }
  throw err;
};

async function openDb() {
  if (canUseIndexedDB()) {
    try {
      const idb = wrap(await openDbWithConfig());

      if (!idb) {
        logger.logError({
          reason: LOGGER.Service.INDEXED_DB_ERROR,
          message: `Failed to open indexedDB without error`,
          attributes: {
            version: database.version,
          },
        });
        return indexedDBPolyfill;
      }
      return idb;
    } catch (err) {
      return handleOpenDbError(err);
    }
  }
  logger.logInfo({
    message: 'Fallback into polyfill for indexedDB',
  });

  return indexedDBPolyfill;
}

function openDbError(err) {
  logger.logError({
    reason: LOGGER.Service.INDEXED_DB_ERROR,
    message: `Failed to open indexedDB: ${err.message}`,
    error: err,
  });
  return indexedDBPolyfill;
}

async function openWithRetry() {
  try {
    return await openDb();
  } catch (err) {
    return openDbError(err);
  }
}

async function saveTempEditModeAnnotChanged(formId, { xfdf }) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(formId))) || {};
    db.put(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, { ...value, xfdf, formId }, String(formId));
  }
  return Promise.resolve();
}

async function saveTempEditModeAnnotChangedByRemoteId(remoteId, { xfdf }) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(remoteId))) || {};
    db.put(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, { ...value, xfdf, remoteId }, String(remoteId));
  }
  return Promise.resolve();
}

async function saveTempEditModeFieldChanged(formId, { formField }) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(formId))) || {};
    db.put(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, { ...value, formField, formId }, String(formId));
  }
  return Promise.resolve();
}

async function saveTempEditModeFieldChangedByRemoteId(remoteId, { formField }) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(remoteId))) || {};
    db.put(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, { ...value, formField, remoteId }, String(remoteId));
  }
  return Promise.resolve();
}

async function getTempEditModeFileChanged(id) {
  const db = await openWithRetry();
  if (db) {
    return db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(id));
  }
  return Promise.resolve(null);
}

async function getTempEditModeFileChangedByRemoteId(remoteId) {
  const db = await openWithRetry();
  if (db) {
    return db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(remoteId));
  }
  return Promise.resolve(null);
}

async function getTempEditModeFileChangedByDocumentId(documentId) {
  const db = await openWithRetry();
  if (db) {
    const results = await db.getAll(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED);
    return results.find((result) => result.documentRemoteId === documentId) ?? null;
  }
  return Promise.resolve(null);
}

async function deleteTempEditModeFileChanged(documentId) {
  const db = await openWithRetry();
  if (db) {
    return db.delete(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(documentId));
  }
  return Promise.resolve();
}

async function markDeleteTempEditModeFileChanged({ id, documentRemoteId }) {
  const db = await openWithRetry();
  if (db) {
    const value = await db.get(INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED, String(id));
    if (value) {
      db.put(
        INDEXED_DB_TABLES.TEMP_EDIT_MODE_FILE_CHANGED,
        {
          ...value,
          isDeleted: true,
          documentRemoteId,
        },
        String(id)
      );
    }
  }
}

async function getOfflineTrackingEvents() {
  const db = await openWithRetry();
  return (await db.get(INDEXED_DB_TABLES.DOCUMENT_OFFLINE_TRACKING_EVENTS, 'offlineEvents')) || [];
}

async function addOfflineTrackingEvents(offlineEvents) {
  const db = await openWithRetry();
  const value = await getOfflineTrackingEvents();
  await db.put(INDEXED_DB_TABLES.DOCUMENT_OFFLINE_TRACKING_EVENTS, [...value, offlineEvents], 'offlineEvents');
}

async function clearOfflineTrackingEvents() {
  const db = await openWithRetry();
  await db.clear(INDEXED_DB_TABLES.DOCUMENT_OFFLINE_TRACKING_EVENTS);
}

async function addSignature(signature) {
  const db = await openWithRetry();
  const currentSignatures = (await db.get(INDEXED_DB_TABLES.INFO, 'signature')) || [];
  await db.put(INDEXED_DB_TABLES.INFO, [signature, ...currentSignatures], 'signature');
}

async function updateSignatures(userSignatures) {
  const db = await openWithRetry();
  await db.put(INDEXED_DB_TABLES.INFO, userSignatures, 'signature');
}

async function getCloudDocList(oldList = []) {
  const db = await openWithRetry();
  const value = (await db.getAll(INDEXED_DB_TABLES.CLOUD_DOCUMENTS)) || [];

  return {
    documentListOffline: oldList,
    cloudList: value,
  };
}

async function setCloudDoclist(docList) {
  const db = await openWithRetry();
  await db.clear(INDEXED_DB_TABLES.CLOUD_DOCUMENTS);
  docList.slice(0, MAX_DOCUMENT_STORED).forEach((document) => db.put(INDEXED_DB_TABLES.CLOUD_DOCUMENTS, document));
}

async function getAllSystemFile() {
  const db = await openWithRetry();
  const value = await db.getAll(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS);
  return value || [];
}

async function deleteSystemFile(fileId) {
  const db = await openWithRetry();
  await db.delete(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS, fileId);
}

async function insertDocuments(documents) {
  const db = await openWithRetry();
  const value = (await db.getAll(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS)) || [];

  const newDocuments = [];
  const existedDocuments = [];
  await Promise.all(
    documents.map(async (document) => {
      const existedEntry = await findFileEntry(value, document.fileHandle);
      if (!existedEntry) {
        await db.put(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS, document);
        newDocuments.push(document);
      } else {
        existedDocuments.push(existedEntry);
      }
    })
  );
  return {
    newDocuments,
    existedDocuments,
  };
}

async function findSystemDocument(document) {
  const db = await openWithRetry();
  const value = (await db.getAll(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS)) || [];

  return findFileEntry(value, document.fileHandle);
}

async function findElectronSystemDocument(document) {
  const db = await openWithRetry();
  const value = (await db.getAll(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS)) || [];

  return value.find((doc) => doc.platform === PLATFORM.ELECTRON && doc.filePath === document.filePath);
}

async function getSystemFile({ fileId, onError = () => {} }) {
  try {
    const db = await openWithRetry();
    const currentDocument = await db.get(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS, fileId);

    if (currentDocument.platform === PLATFORM.ELECTRON) {
      return await getElectronFile(currentDocument);
    }

    return await getWebFile(currentDocument, onError);
  } catch (error) {
    onError(error);
    throw error;
  }
}

async function getElectronFile(currentDocument) {
  const file = await window.electronAPI.readFile(currentDocument.filePath);
  return {
    ...currentDocument,
    file,
    lastModify: currentDocument.lastAccess,
    isSystemFile: true,
  };
}

async function getWebFile(currentDocument, onError) {
  try {
    const permission = await currentDocument.fileHandle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      throw new Error('Not allowed to open file');
    }

    const file = await currentDocument.fileHandle.getFile();
    return {
      ...currentDocument,
      file,
      lastModify: file.lastAccess,
      isSystemFile: true,
    };
  } catch (error) {
    onError(error);
    throw error;
  }
}

async function getStarSystemFiles() {
  const db = await openWithRetry();
  const value = await db.getAll(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS);

  return (value || []).filter((item) => item.isStarred);
}

async function updateSystemFile(documentId, updatedProps) {
  const db = await openWithRetry();
  const document = await db.get(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS, documentId);

  if (document) {
    await db.put(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS, {
      ...document,
      ...updatedProps,
      _id: documentId,
    });
    return db.get(INDEXED_DB_TABLES.SYSTEM_DOCUMENTS, documentId);
  }

  return null;
}

async function getUserSignatures() {
  const db = await openWithRetry();
  return (await db.get(INDEXED_DB_TABLES.INFO, 'signature')) || [];
}

async function setOfflineDocumentListInfo(documentList, override = true) {
  /*
    {
      lastUrl: Eg: /documents/personal, /workspace/dgroup-co/documents/
      folders,
    }
  */
  const db = await openWithRetry();

  if (override) {
    return db.put(INDEXED_DB_TABLES.INFO, documentList, 'document_list');
  }

  const value = await db.get(INDEXED_DB_TABLES.INFO, 'document_list');

  return db.put(
    INDEXED_DB_TABLES.INFO,
    {
      ...value,
      ...documentList,
    },
    'document_list'
  );
}

async function getOfflineDocumentListInfo() {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.INFO, 'document_list');
}

async function setAccountEnabledOffline(info) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, info, 'offline_user');
}

async function setCurrentUser(user) {
  const db = await openWithRetry();
  db.put(INDEXED_DB_TABLES.INFO, user, 'user');
}

async function setCurrentOrganization(organization) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, organization, 'organization');
}

async function setCurrentTeam(currentTeam) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, currentTeam, 'team');
}

async function setOrganizations(organizations) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, organizations, 'organizations');
}

async function setOfflineActor(email) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, email, 'offline_actor');
}

async function getAccountEnabledOffline() {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.INFO, 'offline_user');
  return value || {};
}

async function getCurrentOfflineVersion() {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.INFO, 'version');
  return value || '';
}

async function shouldManualUpdate() {
  const db = await openWithRetry();
  const [isManualUpdate, currentVersion] = await Promise.all([
    db.get(INDEXED_DB_TABLES.INFO, 'manual_update'),
    db.get(INDEXED_DB_TABLES.INFO, 'version'),
  ]);
  return currentVersion !== process.env.VERSION && isManualUpdate;
}

async function isOfflineInstallProcessing() {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.INFO, 'offline_processing');
}

async function getOfflineInfo() {
  const db = await openWithRetry();
  const result = {
    user: null,
    organizations: [],
    organization: {
      data: undefined,
      loading: true,
      error: null,
    },
    team: null,
    document_list: {
      lastUrl: null,
    },
  };
  const tx = db.transaction(INDEXED_DB_TABLES.INFO);
  let cursor = await tx.store.openCursor();
  while (cursor) {
    const { primaryKey, value } = cursor;
    result[primaryKey] = value;
    // eslint-disable-next-line no-await-in-loop
    cursor = await cursor.continue();
  }
  if (typeof tx?.done === 'function') {
    tx.done();
  }
  return result;
}

async function getAllCachingFile() {
  const db = await openWithRetry();
  return (await db.getAll(INDEXED_DB_TABLES.DOCUMENTS_CACHING)) || [];
}

async function insertCachingFile(currentDocument) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.DOCUMENTS_CACHING, currentDocument);
}

async function getCachingFile(documentId) {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.DOCUMENTS_CACHING, documentId);
}

async function deleteCachingFile(documentId) {
  const db = await openWithRetry();
  return Promise.all([
    db.delete(INDEXED_DB_TABLES.DOCUMENTS_CACHING, documentId),
    db.delete(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId),
  ]);
}

async function getAllCommands(documentId) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId);

  const {
    commands: { annotations = [], manipulations = [], fields = [] },
  } = value || { commands: { annotations: [], manipulations: [], fields: [] } };
  return { annotations, manipulations, fields };
}

async function deleteAllCommands(documentId) {
  const db = await openWithRetry();
  return db.delete(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId);
}

async function insertAnnotation(documentId, { annots }) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId);

  const { commands } = value || { commands: {} };
  const { annotations = [] } = commands;
  annots.forEach((annot) => {
    const idx = annotations.findIndex(({ annotationId: Id }) => Id === annot.annotationId);
    if (idx !== -1) {
      annotations.splice(idx, 1);
    }
    annotations.push(annot);
  });

  return db.put(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, {
    _id: documentId,
    commands: {
      ...commands,
      annotations,
    },
  });
}

async function findCommandAndOverride({ documentId, annotationId, overrideObj }) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId);

  const { commands } = value || { commands: {} };
  const { annotations = [] } = commands;

  const idx = annotations.findIndex(({ annotationId: Id }) => Id === annotationId);
  let annot;
  if (idx !== -1) {
    annot = annotations[idx];
    annotations.splice(idx, 1);
  }
  annotations.push({ ...annot, ...overrideObj });

  return db.put(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, {
    _id: documentId,
    commands: {
      ...commands,
      annotations,
    },
  });
}

async function insertManipulation(documentId, newManipulation) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId);

  const { commands } = value || { commands: {} };
  const { manipulations = [] } = commands;
  return db.put(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, {
    _id: documentId,
    commands: {
      ...commands,
      manipulations: [...manipulations, newManipulation],
    },
  });
}

async function insertField(documentId, newField) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, documentId);

  const { commands } = value || { commands: {} };
  const { fields = [] } = commands;
  return db.put(INDEXED_DB_TABLES.DOCUMENT_COMMANDS, {
    _id: documentId,
    commands: {
      ...commands,
      fields: [...fields, newField],
    },
  });
}

async function getAllTempAction(documentId) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_TEMP_COMMANDS, documentId);

  const { actions = [] } = value || {};
  return actions;
}

async function insertTempAction(documentId, newActions = []) {
  const db = await openWithRetry();
  const value = await db.get(INDEXED_DB_TABLES.DOCUMENT_TEMP_COMMANDS, documentId);

  const { actions = [] } = value || {};
  return db.put(INDEXED_DB_TABLES.DOCUMENT_TEMP_COMMANDS, {
    _id: documentId,
    actions: [...actions, ...newActions],
  });
}

async function deleteTempAction(documentId) {
  const db = await openWithRetry();

  return db.delete(INDEXED_DB_TABLES.DOCUMENT_TEMP_COMMANDS, documentId);
}

async function setFolderList(folders) {
  return setOfflineDocumentListInfo(
    {
      folders,
    },
    false
  );
}

async function setPremiumToolsInfo(toolsInfo) {
  const db = await openWithRetry();
  db.put(INDEXED_DB_TABLES.INFO, toolsInfo, 'premiumToolsInfo');
}

async function getPremiumToolsInfo() {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.INFO, 'premiumToolsInfo');
}

async function getFrequentlyUsedDocument(documentId) {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING, documentId);
}

async function insertFrequentlyUsedDocument(document) {
  const db = await openWithRetry();
  db.put(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING, document);
}

async function updateFrequentlyUsedDocument(documentId, updatedProps) {
  const db = await openWithRetry();
  const document = await db.get(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING, documentId);

  if (document) {
    await db.put(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING, {
      ...document,
      ...updatedProps,
      _id: documentId,
    });
    return db.get(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING, documentId);
  }

  return null;
}

async function getAllFrequentlyUsedDocuments() {
  const db = await openWithRetry();
  return (await db.getAll(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING)) || [];
}

async function deleteFrequentlyUsedDocument(documentId) {
  const db = await openWithRetry();
  await db.delete(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING, documentId);
}

async function deleteAllFrequentlyUsedDocuments() {
  const db = await openWithRetry();
  await db.clear(INDEXED_DB_TABLES.FREQUENTLY_USED_DOCUMENTS_CACHING);
}

async function setAutoCompleteFormField(value, userId) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, value, `is_enabled_auto_complete_form_field_${userId}`);
}

async function isEnabledAutoCompleteFormField(userId) {
  const db = await openWithRetry();
  const isEnable = await db.get(INDEXED_DB_TABLES.INFO, 'is_enabled_auto_complete_form_field');
  // migrate to a new key
  if (typeof isEnable === 'boolean') {
    this.setAutoCompleteFormField(isEnable, userId);
    db.delete(INDEXED_DB_TABLES.INFO, 'is_enabled_auto_complete_form_field');
    return isEnable;
  }
  return db.get(INDEXED_DB_TABLES.INFO, `is_enabled_auto_complete_form_field_${userId}`);
}

async function getAllFormFieldSuggestions() {
  const db = await openWithRetry();
  const value = (await db.getAll(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS)) || [];
  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  value.sort((a, b) => collator.compare(a.content, b.content));
  return value;
}

async function getFormFieldSuggestion(suggestion) {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS, suggestion);
}

async function countFormFieldSuggestions() {
  const db = await openWithRetry();
  return db.count(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS);
}

async function addFormFieldSuggestion(content) {
  const db = await openWithRetry();
  const value = (await db.get(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS, content)) || {};
  const previousCount = value.count || 0;
  const data = {
    content,
    count: previousCount + 1,
    dateStamp: Date.now(),
  };
  await db.put(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS, data, content);
  return data;
}

async function deleteFormFieldSuggestion(content) {
  const db = await openWithRetry();
  const item = await db.get(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS, content);
  await db.delete(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS, content);
  return item;
}

async function putProfileDataByKey(key, value) {
  const db = await openWithRetry();
  return db.put(INDEXED_DB_TABLES.INFO, value, key);
}

async function getProfileDataByKey(key) {
  const db = await openWithRetry();
  return db.get(INDEXED_DB_TABLES.INFO, key);
}

async function clearFormFieldSuggestions() {
  const db = await openWithRetry();

  return db.clear(INDEXED_DB_TABLES.FORM_FIELD_SUGGESTIONS);
}

async function getAutoDetectFormFields(documentId, pages = []) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, String(documentId))) || {};
    if (pages.length) {
      return produce({}, (draft) => {
        if (!draft.predictions) {
          draft.predictions = {};
        }

        pages.forEach((page) => {
          draft.predictions[page] = value.predictions[page] || [];
        });
      });
    }
    return value;
  }
  return Promise.resolve({});
}

async function saveAutoDetectFormFields(documentId, data) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, String(documentId))) || {};
    const mergedData = produce(value, (draft) => {
      if (!draft.predictions) {
        draft.predictions = {};
      }

      Object.keys(data).forEach((pageNumber) => {
        draft.predictions[pageNumber] = [...(draft.predictions[pageNumber] || []), ...data[pageNumber]];
      });
    });

    db.put(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, mergedData, String(documentId));
  }
  return Promise.resolve();
}

async function deleteAutoDetectFormFields(documentIds) {
  const db = await openWithRetry();
  if (db) {
    documentIds.forEach((documentId) => {
      db.delete(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, String(documentId));
    });
  }
  return Promise.resolve();
}

async function removeFieldsFromAutoDetectFormFields({ documentId, deletedFields }) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, String(documentId))) || {};
    const updatedValue = produce(value, (draft) => {
      if (!draft.predictions) {
        draft.predictions = {};
      }

      deletedFields.forEach((deletedField) => {
        draft.predictions[deletedField.pageNumber] = (draft.predictions[deletedField.pageNumber] || []).map(
          (field) => ({
            ...field,
            isDeleted: deletedField.fieldId === field.fieldId,
          })
        );
      });
    });

    db.put(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, updatedValue, String(documentId));
  }
  return Promise.resolve();
}

async function updateAutoDetectFormFieldsPageNumber({ documentId, pageMapper, manipulationId }) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, String(documentId))) || {};
    const mergedData = produce(value, (draft) => {
      const originalManipStepIdsSet = new Set(draft.manipStepIds || []);
      if (originalManipStepIdsSet.has(manipulationId)) {
        return;
      }

      if (!draft.predictions) {
        draft.predictions = {};
      }

      if (manipulationId) {
        originalManipStepIdsSet.add(manipulationId);
        draft.manipStepIds = Array.from(originalManipStepIdsSet);
      }

      Object.keys(draft.predictions || {})
        .map(Number)
        .sort((a, b) => b - a)
        .forEach((pageNumber) => {
          const mappedPage = pageMapper.get(pageNumber);
          if (mappedPage === null) {
            delete draft.predictions[pageNumber];
            return;
          }

          if (mappedPage && pageNumber !== mappedPage) {
            draft.predictions[mappedPage] = draft.predictions[pageNumber] || [];
            delete draft.predictions[pageNumber];
          }
        });
    });

    db.put(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, mergedData, String(documentId));
  }
  return Promise.resolve();
}

async function updateAutoDetectFormFields(documentId, data) {
  const db = await openWithRetry();
  if (db) {
    db.put(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, data, String(documentId));
  }
  return Promise.resolve();
}

async function recoverDetectedPlaceholders({
  documentId,
  recoverableDetectedPlaceholders,
  shouldAddDetectedPlaceholder = false,
}) {
  const db = await openWithRetry();
  if (db) {
    const value = (await db.get(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, String(documentId))) || {};
    const updatedValue = produce(value, (draft) => {
      recoverableDetectedPlaceholders.forEach((fieldIds, pageNumber) => {
        if (!draft.predictions) {
          draft.predictions = {};
        }

        draft.predictions[pageNumber] = draft.predictions[pageNumber].map((field) => {
          if (fieldIds.includes(field.fieldId) && field.isDeleted) {
            return { ...field, isDeleted: false };
          }

          return field;
        });
      });
    });

    db.put(INDEXED_DB_TABLES.AUTO_DETECT_FORM_FIELDS, updatedValue, String(documentId));
    if (!shouldAddDetectedPlaceholder) {
      return { predictions: {} };
    }

    const recoveredDetectedPlaceholders = new Map();
    recoverableDetectedPlaceholders.forEach((fieldIds, pageNumber) => {
      if (!updatedValue.predictions) {
        updatedValue.predictions = {};
      }

      updatedValue.predictions[pageNumber].forEach((field) => {
        if (fieldIds.includes(field.fieldId) && !field.isDeleted) {
          recoveredDetectedPlaceholders.set(pageNumber, [
            ...(recoveredDetectedPlaceholders.get(pageNumber) || []),
            field,
          ]);
        }
      });
    });

    return { predictions: Object.fromEntries(recoveredDetectedPlaceholders) };
  }

  return Promise.resolve({});
}

async function getGuestModeManipulateDocument(remoteId) {
  const db = await openWithRetry();
  if (db) {
    return db.get(INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS, remoteId);
  }
  return Promise.resolve(null);
}

async function insertGuestModeManipulateDocument(remoteId, lastModified, count) {
  const db = await openWithRetry();
  if (db) {
    db.put(
      INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS,
      {
        _id: remoteId,
        lastModified,
        cachePath: remoteId,
        count,
      },
    );
  }
  return Promise.resolve();
}

async function getGuestModeManipulateByDocumentId(documentId) {
  const db = await openWithRetry();
  if (db) {
    const results = await db.getAll(INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS);
    return results.find((result) => result.documentId === documentId) || null;
  }
  return Promise.resolve(null);
}

async function updateGuestModeManipulateDocument(remoteId, updates) {
  const db = await openWithRetry();
  if (db) {
    const existingData = (await db.get(INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS, remoteId)) || {};
    await db.put(
      INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS,
      {
        ...existingData,
        ...updates,
        _id: remoteId,
      },
    );
  }
  return Promise.resolve();
}

async function getAllGuestModeManipulateDocument() {
  const db = await openWithRetry();
  if (db) {
    const results = await db.getAll(INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS);
    return results || [];
  }
  return Promise.resolve({});
}

async function deleteGuestModeManipulateDocument(remoteId) {
  const db = await openWithRetry();
  if (db) {
      await db.delete(INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS, remoteId);
  }
  return Promise.resolve();
}

async function deleteAllGuestModeManipulateDocument() {
  const db = await openWithRetry();
  if (db) {
    await db.clear(INDEXED_DB_TABLES.GUEST_MODE_MANIPULATE_DOCUMENTS);
  }
  return Promise.resolve({});
}

export default {
  addSignature,
  updateSignatures,
  deleteSystemFile,
  insertDocuments,
  getAllSystemFile,
  getSystemFile,
  getCloudDocList,
  updateSystemFile,
  getUserSignatures,
  setCurrentUser,
  getOfflineInfo,
  setCloudDoclist,
  setCurrentOrganization,
  setOrganizations,
  setCurrentTeam,
  setOfflineDocumentListInfo,
  setOfflineActor,
  getAllCachingFile,
  insertCachingFile,
  getCachingFile,
  deleteCachingFile,
  setAccountEnabledOffline,
  getAccountEnabledOffline,
  insertAnnotation,
  insertManipulation,
  getAllCommands,
  deleteAllCommands,
  isOfflineInstallProcessing,
  getAllTempAction,
  insertTempAction,
  deleteTempAction,
  getCurrentOfflineVersion,
  shouldManualUpdate,
  setFolderList,
  getOfflineDocumentListInfo,
  getStarSystemFiles,
  openDb: openWithRetry,
  findSystemDocument,
  setPremiumToolsInfo,
  getPremiumToolsInfo,
  addOfflineTrackingEvents,
  getOfflineTrackingEvents,
  clearOfflineTrackingEvents,
  findCommandAndOverride,
  getFrequentlyUsedDocument,
  insertFrequentlyUsedDocument,
  updateFrequentlyUsedDocument,
  getAllFrequentlyUsedDocuments,
  deleteFrequentlyUsedDocument,
  markDeleteTempEditModeFileChanged,
  setAutoCompleteFormField,
  isEnabledAutoCompleteFormField,
  getAllFormFieldSuggestions,
  addFormFieldSuggestion,
  deleteFormFieldSuggestion,
  countFormFieldSuggestions,
  getFormFieldSuggestion,
  putProfileDataByKey,
  getProfileDataByKey,
  clearFormFieldSuggestions,
  canUseIndexedDB,
  deleteAllFrequentlyUsedDocuments,
  insertField,
  saveTempEditModeAnnotChanged,
  saveTempEditModeFieldChanged,
  getTempEditModeFileChanged,
  deleteTempEditModeFileChanged,
  getTempEditModeFileChangedByDocumentId,
  getTempEditModeFileChangedByRemoteId,
  saveTempEditModeFieldChangedByRemoteId,
  saveTempEditModeAnnotChangedByRemoteId,
  getAutoDetectFormFields,
  saveAutoDetectFormFields,
  deleteAutoDetectFormFields,
  removeFieldsFromAutoDetectFormFields,
  updateAutoDetectFormFieldsPageNumber,
  updateAutoDetectFormFields,
  recoverDetectedPlaceholders,
  findElectronSystemDocument,
  getGuestModeManipulateDocument,
  insertGuestModeManipulateDocument,
  getAllGuestModeManipulateDocument,
  deleteGuestModeManipulateDocument,
  deleteAllGuestModeManipulateDocument,
  getGuestModeManipulateByDocumentId,
  updateGuestModeManipulateDocument,
};
