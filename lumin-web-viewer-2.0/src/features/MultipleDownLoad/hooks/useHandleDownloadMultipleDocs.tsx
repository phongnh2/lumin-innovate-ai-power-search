/* eslint-disable @typescript-eslint/no-unsafe-call */
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import JSZipType from 'jszip';
import { closeSnackbar } from 'lumin-ui/kiwi-ui';
import React, { ReactNode, useCallback, useContext, useRef } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 } from 'uuid';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { DocumentContext } from 'luminComponents/Document/context';

import { useGetCurrentOrganization, useHitDocStackModalForOrgMembers, useTranslation, useShallowSelector } from 'hooks';

import { documentServices, organizationServices } from 'services';
import { documentGraphServices } from 'services/graphServices';
import * as folderApi from 'services/graphServices/folder';

import { isIE } from 'helpers/device';
import getOrgOfDoc from 'helpers/getOrgOfDoc';
import logger from 'helpers/logger';
import sequentialRequestBuilder from 'helpers/sequentialRequestBuilder';

import { ActionName, ErrorType } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';
import fileUtil from 'utils/file';
import { ErrorBase } from 'utils/oneDriveError';
import { PaymentUrlSerializer } from 'utils/payment';
// eslint-disable-next-line no-restricted-imports
import toastUtils from 'utils/toastUtils';

import useHandleCheckPermission from 'features/MultipleDownLoad/hooks/useHandleCheckPermission';
import { useHandleError } from 'features/MultipleDownLoad/hooks/useHandleError';
import { ErrorDocument, FileData, FolderDataWithFiles } from 'features/MultipleDownLoad/interfaces';
import { RemoteDocumentItem } from 'features/MultipleMerge/core/documentItem/remote';
import { UploadStatus, UploadDocumentError } from 'features/MultipleMerge/enum';
import { PdfProcessor } from 'features/PdfProcessor/pdfProcessor';

import { DataElements } from 'constants/dataElement';
import { documentStorage, modifiedFilter, ownerFilter } from 'constants/documentConstants';
import { general } from 'constants/documentType';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

import { ErrorModalType } from '../constants';
import styles from '../MultipleDownLoadButton.module.scss';
import {
  setErrorModalOpened,
  addErrorType,
  addErrorDocument as addErrorDocumentAction,
  setErrorModalType,
  resetHasOpenedDropboxAuthWindow,
} from '../slice';
import { getUniqueName } from '../utils';

const MAX_DOWNLOAD_DOCUMENTS = 20;
const MAX_DOWNLOAD_DOCUMENTS_SIZE = 500;

const logBulkDownloadError = (totalDocs: number, error: ErrorType | string, downloadId?: string) => {
  docActionsEvent
    .bulkDownloadError({
      downloadId,
      numberSelectedDocs: totalDocs,
      error,
    })
    .catch(() => {});
};

const getFormattedDateTime = () => dayjs().format('YYYYMMDDTHHmmss');

const zipAndSaveFiles = async (zip: JSZipType, filesReadyToZip: { name: string; file: Blob }[]) => {
  // Zip selected documents
  const usedDocNames = new Set<string>();
  filesReadyToZip.forEach((fileData) => {
    const finalFileName = getUniqueName({
      name: fileData.name,
      usedNames: usedDocNames,
      kind: 'doc',
    });
    zip.file(finalFileName, fileData.file);
  });
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `LuminPDF_Download_${getFormattedDateTime()}.zip`);
};

const useHandleDownloadMultipleDocs = () => {
  const { t } = useTranslation();
  const { selectedDocList, selectedFolders } = useContext(DocumentContext);
  const dispatch = useDispatch();
  const downloadId = useRef<string | null>(null);

  const currentOrganization = useGetCurrentOrganization();
  const organizations = useShallowSelector(selectors.getOrganizationList);
  const hitDocStackModalSettings = useHitDocStackModalForOrgMembers({ orgOfDoc: currentOrganization });

  const { checkDriveDocument, checkOneDriveDocument, checkDropboxDocument } = useHandleCheckPermission();
  const { getOneDriveErrorMessage, getGoogleDriveErrorMessage, getDropboxErrorMessage } = useHandleError();

  const trackBulkDownloadErrorAndOpenModal = useCallback(({ modalType }: { modalType: ErrorModalType }) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { getState } = store;
    const state = getState();
    const { errorTypes, errorDocuments } = state.multipleDownload;
    if (!errorDocuments.length) {
      return;
    }
    logBulkDownloadError(errorDocuments.length, errorTypes.join(', '), downloadId.current);
    dispatch(setErrorModalType(modalType));
    dispatch(setErrorModalOpened(true));
  }, []);

  const addError = (newError: string) => {
    dispatch(addErrorType(newError));
  };

  const addErrorDocument = (newErrorDocument: ErrorDocument) => {
    dispatch(addErrorDocumentAction(newErrorDocument));
  };

  const checkDownloadConditions = useCallback(async (): Promise<boolean> => {
    const orgId = currentOrganization?._id;
    const selectedDocumentIds = selectedDocList.map((doc) => doc._id);
    const selectedFolderIds = selectedFolders.map((folder) => folder._id);

    try {
      const res = await documentServices.checkDownloadMultipleDocuments({
        orgId,
        documentIds: selectedDocumentIds,
        folderIds: selectedFolderIds,
      });
      const { isDocStackInsufficient, isDocumentLimitExceeded, isTotalSizeExceeded, totalDocuments } = res;
      docActionsEvent
        .bulkActions({
          actionName: ActionName.DOWNLOAD,
          numberSelectedDocs: totalDocuments,
          numberSelectedFolders: selectedFolders.length,
        })
        .catch(() => {});
      if (isDocStackInsufficient) {
        dispatch(actions.openModal(hitDocStackModalSettings));
        logBulkDownloadError(totalDocuments, ErrorType.INSUFFICIENT_DOC_STACK);
        return false;
      }

      if (isDocumentLimitExceeded) {
        toastUtils.error({ message: t('multipleDownload.totalDocumentsExceed', { limit: MAX_DOWNLOAD_DOCUMENTS }) });
        logBulkDownloadError(totalDocuments, ErrorType.TOO_MANY_FILES_SELECTED);
        return false;
      }

      if (isTotalSizeExceeded) {
        toastUtils.error({
          message: t('multipleDownload.totalDocumentsSizeExceed', { limit: MAX_DOWNLOAD_DOCUMENTS_SIZE }),
        });
        logBulkDownloadError(totalDocuments, ErrorType.EXCEEDED_FILE_LIMIT);
        return false;
      }

      return true;
    } catch (error) {
      toastUtils.openUnknownErrorToast();
      logger.logInfo({
        reason: 'checkDownloadMultipleDocuments',
        message: 'Error checking download multiple documents',
        attributes: {
          orgId,
          documentIds: selectedDocumentIds,
          folderIds: selectedFolderIds,
        },
        error: error as Error,
      });
      return false;
    }
  }, [currentOrganization, hitDocStackModalSettings, selectedDocList, selectedFolders, dispatch, t]);

  const checkExpiredDocumentOrPermissionDenied = ({
    document,
    checkOnly = false,
  }: {
    document: IDocumentBase;
    checkOnly?: boolean;
  }) => {
    const { canExport = true } = document.capabilities || {};
    if (checkOnly) {
      return document.isOverTimeLimit || !canExport;
    }
    if (document.isOverTimeLimit) {
      let errorMessage: string | ReactNode = t('multipleDownload.expiredDocumentForMember');
      const orgOwnCurrentDoc = getOrgOfDoc({ organizations, currentDocument: document });
      const isManager = organizationServices.isManager(orgOwnCurrentDoc?.userRole);
      if (isManager) {
        const paymentUrl = new PaymentUrlSerializer().of(currentOrganization?._id).returnUrlParam().pro;
        errorMessage = (
          <Trans
            i18nKey="multipleDownload.expiredDocumentForAdmin"
            // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
            components={{
              b: <Link to={paymentUrl} target="_blank" className={styles.link} rel="noreferrer" />,
            }}
          />
        );
      }
      if (document.isShared) {
        errorMessage = t('multipleDownload.requestOwnerUpgradePlan');
      }
      addErrorDocument({ _id: document._id, name: document.name, errorMessage });
      dispatch(addErrorType(ErrorType.DOCUMENT_EXPIRED));
      return true;
    }
    if (!canExport) {
      addErrorDocument({ _id: document._id, name: document.name, errorMessage: t('shareSettings.permissionDenied') });
      dispatch(addErrorType(ErrorType.DOCUMENT_PERMISSION_DENIED));
      return true;
    }
    return false;
  };

  const handleServiceError = (
    error: Error | { errors: [ErrorBase] },
    doc: IDocumentBase,
    errorHandler: (params: unknown) => { errorMessage: string; errorType: string }
  ) => {
    const { errorMessage, errorType } = errorHandler({ error, doc });
    addErrorDocument({ _id: doc._id, name: doc.name, errorMessage });
    addError(errorType);
  };

  const getDocPDF = async (doc: IDocumentBase) => {
    // Check service permissions
    const { service } = doc;
    try {
      switch (service) {
        case documentStorage.google:
          await checkDriveDocument(doc);
          break;
        case documentStorage.onedrive:
          await checkOneDriveDocument(doc);
          break;
        case documentStorage.dropbox:
          await checkDropboxDocument({ document: doc });
          break;
        default:
          break;
      }
    } catch (error) {
      const errorHandlers = {
        [documentStorage.google]: getGoogleDriveErrorMessage,
        [documentStorage.onedrive]: getOneDriveErrorMessage,
        [documentStorage.dropbox]: getDropboxErrorMessage,
      };
      handleServiceError(error as Error, doc, errorHandlers[doc.service]);
      return undefined;
    }

    const documentItem = new RemoteDocumentItem({
      _id: doc._id,
      abortSignal: null,
      name: doc.name,
      remoteId: doc._id,
      onError: () => {},
      onLoadDocumentComplete: () => {
        dispatch(actions.closeElement(DataElements.PASSWORD_MODAL));
        dispatch(actions.setPasswordProtectedDocumentName(''));
      },
      onSetupPasswordHandler: ({ attempt, name }) => {
        dispatch(actions.openElement(DataElements.PASSWORD_MODAL));
        dispatch(actions.setPasswordProtectedDocumentName(name));
        dispatch(actions.setPasswordAttempts(attempt));
      },
      onCancelPassword: () => {
        addErrorDocument({ _id: doc._id, name: doc.name, errorMessage: t('multipleDownload.documentEncrypted') });
        addError(ErrorType.DOCUMENT_SECURED);
      },
    });

    try {
      const {
        document,
        annotations,
        outlines: arrOutline,
        buffer,
        fields,
        signedUrls,
        status,
        metadata,
      } = await documentItem.getDocumentData({ loadAsPDF: true });

      if (status === UploadStatus.FAILED && metadata?.errorCode === UploadDocumentError.FILE_ENCRYPTED) {
        return undefined;
      }

      if (!buffer) {
        throw new Error('Failed to load document');
      }

      const pdfProcessor = new PdfProcessor(document, annotations, fields, arrOutline, signedUrls, buffer);
      const pdfDoc = await pdfProcessor.process();
      const arr = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
      const fileName = fileUtil.convertExtensionToPdf(doc.name);
      let file;
      if (isIE) {
        file = new Blob([arr], { type: general.PDF });
      } else {
        file = new File([arr], fileName, {
          type: general.PDF,
        });
      }

      return { _id: doc._id, file, name: fileName };
    } catch (error) {
      addErrorDocument({
        _id: doc._id,
        name: doc.name,
        errorMessage: (error as Error).message || t('multipleDownload.errorGettingDocumentData'),
      });
      addError(ErrorType.ERROR_GETTING_DOCUMENT_DATA);
      logger.logInfo({
        reason: 'getDocPDF',
        message: 'Error getting document data',
        attributes: { doc },
        error: error as Error,
      });
      return undefined;
    }
  };

  const getMultipleDocs = async ({
    documents,
    hasErrorAdded = false,
  }: {
    documents: IDocumentBase[];
    hasErrorAdded?: boolean;
  }) =>
    sequentialRequestBuilder(documents, async (doc) => {
      if (checkExpiredDocumentOrPermissionDenied({ document: doc, checkOnly: hasErrorAdded })) {
        return undefined;
      }

      return getDocPDF(doc);
    });

  const getFolderDocuments = async (folderId: string) =>
    documentGraphServices.getDocumentsInFolder({
      folderId,
      filter: {
        lastModifiedFilterCondition: modifiedFilter.modifiedByAnyone,
        ownedFilterCondition: ownerFilter.byAnyone,
      },
      query: {
        searchKey: '',
        minimumQuantity: MAX_DOWNLOAD_DOCUMENTS,
      },
    });

  const getAllInFolders = async ({
    folders,
    zip,
    allDocumentsInFolders,
  }: {
    folders: IFolder[];
    zip: JSZipType;
    allDocumentsInFolders: FileData[];
  }): Promise<FolderDataWithFiles[]> => {
    const documentsInFolders = await sequentialRequestBuilder(folders, async (folder) => {
      const getDocuments = await getFolderDocuments(folder._id);
      return {
        documents: getDocuments.documents,
        ...folder,
      };
    });
    const filesDataInFolders = await sequentialRequestBuilder(documentsInFolders, async (folder) => {
      const filesData = await getMultipleDocs({ documents: folder.documents });
      return {
        filesData: filesData.filter((fileData) => fileData),
        ...folder,
      };
    });

    // Zip folders
    const usedFolderNames = new Set<string>();
    return Promise.all(
      filesDataInFolders.map(async (folder) => {
        const folderName = getUniqueName({
          name: folder.name,
          usedNames: usedFolderNames,
          kind: 'folder',
        });
        const zipFolder = zip.folder(folderName);

        const usedFileNames = new Set<string>();
        folder.filesData.forEach((fileData) => {
          const fileName = getUniqueName({
            name: fileData.name,
            usedNames: usedFileNames,
            kind: 'doc',
          });
          zipFolder.file(fileName, fileData.file);
        });

        allDocumentsInFolders.push(...folder.filesData);
        return {
          filesData: folder.filesData,
          ...folder,
          subFolders:
            folder.folders?.length && folder.folders.length > 0
              ? await getAllInFolders({ folders: folder.folders, zip: zipFolder, allDocumentsInFolders })
              : [],
        };
      })
    );
  };

  const handleGetAllInFolders = async ({ folders, zip }: { folders: IFolder[]; zip: JSZipType }) => {
    const fullFolderTree = await sequentialRequestBuilder(folders, async (folder) =>
      folderApi.getFolderTree(folder._id)
    );
    const allDocumentsInFolders: FileData[] = [];
    const allInFolders = await getAllInFolders({ folders: fullFolderTree, zip, allDocumentsInFolders });
    return {
      allInFolders,
      allDocumentsInFolders,
    };
  };

  const onDownload = async () => {
    const passedConditions = await checkDownloadConditions();
    if (!passedConditions) {
      return;
    }

    downloadId.current = v4();

    /**
     * Validate all selected documents for expiration or permission issues.
     * Each check adds an error to state to show on the error modal for the user if the document is invalid.
     * If all documents are invalid and no folders are selected, fail fast
     * before showing the "preparing" toast to avoid unnecessary UI flicker.
     */
    const documentInvalidityFlags = selectedDocList.map((doc) =>
      checkExpiredDocumentOrPermissionDenied({ document: doc })
    );
    const isAllSelectedDocListInvalid = documentInvalidityFlags.every((isInvalid) => isInvalid);
    if (isAllSelectedDocListInvalid && !selectedFolders.length) {
      trackBulkDownloadErrorAndOpenModal({ modalType: ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD });
      return;
    }

    const preparingToastId = v4();
    toastUtils
      .info({
        message: t('multipleDownload.preparing'),
        id: preparingToastId,
        persist: true,
        TransitionProps: {
          exit: false,
        },
      })
      .catch(() => {});

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const { allDocumentsInFolders: successDownloadDocsInFolders } = await handleGetAllInFolders({
      folders: selectedFolders,
      zip,
    });

    // Get documents in selected documents
    const filesData = await getMultipleDocs({ documents: selectedDocList, hasErrorAdded: true });
    const filesReadyToZip = filesData.filter((fileData) => fileData);
    dispatch(resetHasOpenedDropboxAuthWindow());

    if (!selectedFolders.length && !filesReadyToZip.length) {
      closeSnackbar(preparingToastId);
      trackBulkDownloadErrorAndOpenModal({ modalType: ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD });
      return;
    }

    await zipAndSaveFiles(zip, filesReadyToZip);
    closeSnackbar(preparingToastId);

    const combinedSuccessDownloadDocs = [...filesReadyToZip, ...successDownloadDocsInFolders];
    docActionsEvent
      .bulkDownloadSuccess({
        downloadId: downloadId.current,
        numberSelectedDocs: combinedSuccessDownloadDocs.length,
        numberSelectedFolders: selectedFolders.length,
      })
      .catch(() => {});
    trackBulkDownloadErrorAndOpenModal({ modalType: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD });

    const successDownloadDocIds = combinedSuccessDownloadDocs.reduce((acc, doc) => [...acc, doc._id], [] as string[]);
    if (!filesReadyToZip.length && !successDownloadDocsInFolders.length) {
      return;
    }
    await documentServices
      .updateStackedDocuments({
        documentIds: successDownloadDocIds,
      })
      .catch((error) => {
        logger.logInfo({
          reason: 'updateStackedDocuments',
          message: 'Error updating stacked documents',
          attributes: {
            documentIds: successDownloadDocIds,
          },
          error: error as Error,
        });
      });
  };

  return {
    onDownload,
  };
};

export default useHandleDownloadMultipleDocs;
