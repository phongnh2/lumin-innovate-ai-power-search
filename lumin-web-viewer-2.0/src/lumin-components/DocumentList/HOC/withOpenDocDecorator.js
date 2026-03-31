import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import OneDriveFilePickerProvider from 'luminComponents/OneDriveFilePicker/OneDriveFilePickerProvider';
import SvgElement from 'luminComponents/SvgElement';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useExpiredDocumentModal, useStrictDownloadGooglePerms, useTranslation } from 'hooks';

import { dropboxServices, googleServices, oneDriveServices } from 'services';

import fireEvent from 'helpers/fireEvent';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { documentStorage } from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';

import { DocumentListContext } from '../Context';
import useAuthenticateService, { DOCUMENT_DECORATOR_ACTION } from '../hooks/useAuthenticateService';

const FileWarningModal = lazyWithRetry(() => import('lumin-components/FileWarningModal'));

export const createDocumentsError = (errors) => {
  const e = new Error('remoteFileError');
  e.errors = errors;
  return e;
};

export const getDocumentsMeta = async (documents, executer) => {
  const promises = await Promise.allSettled(
    documents.map((document) =>
      document.service === documentStorage.onedrive
        ? executer({ driveId: document.externalStorageAttributes.driveId, remoteId: document.remoteId })
        : executer(document.remoteId)
    )
  );
  const mappedPromises = promises.map((promise, index) => ({
    error: promise.status === 'rejected' ? promise.reason : null,
    document: documents[index],
    result: promise.value,
  }));
  const errors = mappedPromises.filter(({ error }) => Boolean(error));
  const results = mappedPromises.filter(({ result }) => Boolean(result));
  if (errors.length) {
    throw createDocumentsError(errors);
  }
  if (results.length) {
    return results;
  }
};

export const hasDownloadDrivePermission = (document) => {
  const { canDownload } = document.capabilities;
  return canDownload;
};

const withOpenDocDecorator = (Component) => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const HOC = (props) => {
    const { folder } = props;
    const [loading, setLoading] = useState(false);
    const { showModal } = useStrictDownloadGooglePerms();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const {
      documentAction,
      setDocumentAction,
      authentication,
      notFoundDocuments,
      setNotFoundDocuments,
      handleCheckError,
    } = useAuthenticateService();
    const { getExpiredModalContent } = useExpiredDocumentModal();

    const getDropboxDocumentsMeta = (documents) => getDocumentsMeta(documents, dropboxServices.getFileMetaData);

    const getDriveDocumentsMeta = (documents) => getDocumentsMeta(documents, googleServices.getFileInfo);

    const getOneDriveDocumentsMeta = (documents) => getDocumentsMeta(documents, oneDriveServices.getFileInfo);

    const checkDriveDocuments = async (documents, action) => {
      if (!documents.length) {
        return;
      }
      await authentication.drive(documents);
      const driveInfo = await getDriveDocumentsMeta(documents);
      return action !== DOCUMENT_DECORATOR_ACTION.OPEN_DOCUMENT || hasDownloadDrivePermission(driveInfo[0].result);
    };

    const checkOneDriveDocuments = async (documents) => {
      if (!documents.length) {
        return;
      }
      await authentication.oneDrive();
      await getOneDriveDocumentsMeta(documents);
      return true;
    };

    const checkDropboxDocuments = async (
      documents,
      { documents: dropboxDocuments, onSuccess = () => {}, executer = () => {} }
    ) => {
      if (!dropboxDocuments.length) {
        return true;
      }
      const isAuthenticated = authentication.dropbox({ documents, onSuccess, executer });
      if (!isAuthenticated) {
        setLoading(false);
        return false;
      }
      await getDropboxDocumentsMeta(dropboxDocuments);
      return true;
    };

    const combineDocumentsError = (promiseResult) => {
      const [googleDriveError, oneDriveError] = promiseResult;
      const hasOneDriveError = oneDriveError.reason && !get(oneDriveError, 'reason.errors', []).length;
      const hasDriveError = googleDriveError.reason && !get(googleDriveError, 'reason.errors', []).length;
      if (hasOneDriveError) {
        throw oneDriveError.reason;
      }
      if (hasDriveError) {
        throw googleDriveError.reason;
      }
      const errorList = promiseResult.reduce((acc, { reason: { errors = [] } = {} }) => {
        acc.push(...errors);
        return acc;
      }, []);
      if (!errorList.length) {
        return;
      }
      throw createDocumentsError(errorList);
    };

    const handleCheckPermission = async ({
      documents,
      driveDocuments,
      dropboxDocuments,
      oneDriveDocuments,
      onSuccess,
      executer,
      action,
    }) => {
      setLoading(true);
      const [googleDriveResult, oneDriveResult, dropboxResult] = await Promise.allSettled([
        checkDriveDocuments(driveDocuments, action),
        checkOneDriveDocuments(oneDriveDocuments),
        checkDropboxDocuments(documents, {
          documents: dropboxDocuments,
          onSuccess,
          executer,
        }),
      ]);
      if (typeof dropboxResult.value === 'boolean' && !dropboxResult.value) {
        return;
      }
      if (
        (typeof googleDriveResult.value === 'boolean' && !googleDriveResult.value) ||
        (typeof oneDriveResult.value === 'boolean' && !oneDriveResult.value)
      ) {
        setLoading(false);
        showModal(
          () =>
            handleCheckPermission({
              documents,
              driveDocuments,
              dropboxDocuments,
              oneDriveDocuments,
              onSuccess,
              executer,
              action,
            }),
          () => {}
        );
        return;
      }
      combineDocumentsError([googleDriveResult, oneDriveResult, dropboxResult]);
      setLoading(false);
      onSuccess();
    };

    const checkDocumentActionPermission = async ({ documents, onSuccess = () => {}, executer = () => {}, action }) => {
      const driveDocuments = documents.filter((document) => document.service === documentStorage.google);
      const dropboxDocuments = documents.filter((document) => document.service === documentStorage.dropbox);
      const oneDriveDocuments = documents.filter((document) => document.service === documentStorage.onedrive);
      if (!dropboxDocuments.length && !driveDocuments.length && !oneDriveDocuments.length) {
        if (documents[0].fileHandle) {
          if (!(await systemFileHandler.preCheckSystemFile(documents[0].fileHandle))) {
            return;
          }
          try {
            await documents[0].fileHandle.getFile();
            onSuccess();
          } catch (e) {
            const modalSetting = {
              type: ModalTypes.ERROR,
              title: t('viewer.fileCannotBeOpened.title'),
              message: (
                <Trans
                  i18nKey="viewer.fileCannotBeOpened.message"
                  values={{ documentName: documents[0].name }}
                  components={{ b: <b /> }}
                />
              ),
              cancelButtonTitle: t('action.leaveIt'),
              confirmButtonTitle: t('common.remove'),
              onCancel: () => {},
              onConfirm: () => systemFileHandler.delete(documents[0]),
              isFullWidthButton: true,
            };
            dispatch(actions.openModal(modalSetting));
          }
          return;
        }
        onSuccess();
        return;
      }
      setLoading(true);
      try {
        const customedOnSuccess = () => {
          driveDocuments.length && fireEvent(CUSTOM_EVENT.SHOW_PROMPT_INVITE_USERS_BANNER);
          onSuccess();
        };

        await handleCheckPermission({
          documents,
          driveDocuments,
          dropboxDocuments,
          oneDriveDocuments,
          onSuccess: customedOnSuccess,
          executer,
          action,
        });
      } catch (error) {
        handleCheckError(error, {
          documents,
          onSuccess,
          executer,
          setLoading,
        });
      }
    };

    const externalDocumentExistenceGuard = useCallback(
      (document, onSuccess = () => {}, documentAction = DOCUMENT_DECORATOR_ACTION.OPEN_DOCUMENT) => {
        setDocumentAction(documentAction);
        checkDocumentActionPermission({
          documents: [document],
          onSuccess,
          executer: (docs, callback) => externalDocumentExistenceGuard(docs[0], callback, documentAction),
          action: documentAction,
        });
      },
      []
    );

    const onMoveDocumentsDecorator = useCallback((documents, onSuccess = () => {}) => {
      setDocumentAction(DOCUMENT_DECORATOR_ACTION.MOVE_MULTIPLE);
      checkDocumentActionPermission({
        documents,
        onSuccess,
        executer: onMoveDocumentsDecorator,
      });
    }, []);

    const onMergeDocumentsDecorator = useCallback((documents, onSuccess = () => {}) => {
      setDocumentAction(DOCUMENT_DECORATOR_ACTION.MERGE_MULTIPLE);
      checkDocumentActionPermission({
        documents,
        onSuccess,
        executer: onMergeDocumentsDecorator,
      });
    }, []);

    const handleCloseFileWarningModal = () => {
      setNotFoundDocuments([]);
      dispatch(actions.resetDocumentNotFound());
    };

    const onHandleDocumentOvertimeLimit = useCallback((document) => {
      const modalContent = getExpiredModalContent(document);
      const setting = {
        ...modalContent,
        customIcon: <SvgElement content="new-warning" className="auto-margin" width={48} alt="modal_image" />,
        type: ModalTypes.WARNING,
        useReskinModal: true,
      };
      dispatch(actions.openModal(setting));
    }, []);

    const context = useMemo(
      () => ({
        externalDocumentExistenceGuard,
        onMoveDocumentsDecorator,
        onHandleDocumentOvertimeLimit,
        onMergeDocumentsDecorator,
      }),
      [
        externalDocumentExistenceGuard,
        onHandleDocumentOvertimeLimit,
        onMoveDocumentsDecorator,
        onMergeDocumentsDecorator,
      ]
    );

    useEffect(() => {
      if (loading) {
        dispatch(actions.openElement('loadingModal'));
      } else {
        dispatch(actions.closeElement('loadingModal'));
      }
      return () => {
        dispatch(actions.closeElement('loadingModal'));
      };
    }, [loading]);

    return (
      <DocumentListContext.Provider value={context}>
        <Component {...props} />
        {!loading && Boolean(notFoundDocuments.length) && (
          <OneDriveFilePickerProvider>
            <FileWarningModal
              documents={notFoundDocuments}
              folderId={folder?._id}
              onClose={handleCloseFileWarningModal}
              documentAction={documentAction}
            />
          </OneDriveFilePickerProvider>
        )}
      </DocumentListContext.Provider>
    );
  };
  HOC.propTypes = {
    folder: PropTypes.object,
  };
  HOC.defaultProps = {
    folder: null,
  };
  return HOC;
};

export default withOpenDocDecorator;
