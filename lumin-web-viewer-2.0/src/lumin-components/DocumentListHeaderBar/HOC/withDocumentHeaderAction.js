/* eslint-disable sonarjs/cognitive-complexity */
import { useSubscription } from '@apollo/client';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';
import {
  shallowEqual, useDispatch, useSelector, batch,
} from 'react-redux';

import { SUB_DELETE_ORIGINAL_DOCUMENT } from 'graphQL/DocumentGraph';

import actions from 'actions';
import selectors from 'selectors';

import { DocumentContext } from 'lumin-components/Document/context';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useDocumentClientId, useGetFolderType, useTranslation, useEnableWebReskin } from 'hooks';
import useDeleteFolder from 'hooks/useDeleteFolder';

import { documentServices } from 'services';
import * as folderApi from 'services/graphServices/folder';

import { toastUtils } from 'utils';
import { ActionName } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { DocumentActions, folderType } from 'constants/documentConstants';
import { CHECKBOX_TYPE, ModalTypes, STATUS_CODE } from 'constants/lumin-common';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

export const withDocumentHeaderAction = (WrappedComponent) => {
  const HOC = (props) => {
    const {
      setRemoveDocList,
      openDocumentModal,
      setRemoveFolderList,
    } = props;
    const { selectedDocList, setIsDeleting, selectedFolders } = useContext(DocumentContext);
    const dispatch = useDispatch();
    const currentFolderType = useGetFolderType();
    const { openDeleteModal } = useDeleteFolder(currentFolderType, selectedFolders[0], setRemoveFolderList);
    const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
    const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
    const { t } = useTranslation();
    const { isEnableReskin } = useEnableWebReskin();

    const { clientId } = useDocumentClientId();

    const { totalActiveMember } = currentOrganization;
    const isInOrganizationDocument = currentFolderType === folderType.ORGANIZATION;
    const isSharedTab = currentFolderType === folderType.SHARED;
    const isDeviceTab = currentFolderType === folderType.DEVICE;
    const isIndividualTab = currentFolderType === folderType.INDIVIDUAL;

    useSubscription(
      SUB_DELETE_ORIGINAL_DOCUMENT,
      {
        variables: {
          clientId: userId,
        },
        onSubscriptionData: ({ subscriptionData: { data: { deleteOriginalDocument } } }) => {
          if (!deleteOriginalDocument) { return; }
          const {
            statusCode, documentList: deletedDocList,
          } = deleteOriginalDocument;
          if (statusCode === STATUS_CODE.SUCCEED) {
            setRemoveDocList({
              data: deletedDocList.map((document) => ({ ...document, _id: document.documentId })),
              type: CHECKBOX_TYPE.DESELECT,
            });
          }
        },
      },
    );

    const getSuccessMessageDeleteMultiple = (type) => {
      if (type === 'folder') {
        return t('modalFolder.foldersHaveBeenRemoved');
      }
      return t(isSharedTab ? 'modalDeleteDoc.documentsHaveBeenRemoved' : 'modalDeleteDoc.documentsHaveBeenDeleted');
    };

    const onRemoveMultipleDoc = async (isCheckedNotify) => {
      setIsDeleting(true);
      try {
        dispatch(actions.updateModalProperties({
          isProcessing: true,
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
        }));
        const selectedDocIds = selectedDocList.map((document) => document._id);
        if (isDeviceTab) {
          await Promise.all(selectedDocList.map((document) => systemFileHandler.delete(document)));
        } else
        if (isSharedTab) {
          await documentServices.deleteSharedDocuments({ documentIds: selectedDocIds });
        } else {
          await documentServices.deleteMultipleDocument({
            documentIds: selectedDocIds,
            clientId,
            isNotify: isCheckedNotify,
          });
        }

        toastUtils.openToastMulti({
          type: ModalTypes.SUCCESS,
          message: getSuccessMessageDeleteMultiple(),
          useReskinToast: true,
        });
      } catch (error) {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          error,
          useReskinToast: true,
        });
      } finally {
        dispatch(actions.closeModal());
        batch(() => {
          setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
          setIsDeleting(false);
        });
      }
    };

    const onRemoveMultipleFolder = async (isCheckedNotify) => {
      setIsDeleting(true);
      try {
        dispatch(
          actions.updateModalProperties({
            isProcessing: true,
            disableBackdropClick: true,
            disableEscapeKeyDown: true,
          })
        );
        const selectedFolderIds = selectedFolders.map((folder) => folder._id);
        await folderApi.deleteMultipleFolder({
          folderIds: selectedFolderIds,
          clientId,
          isNotify: isCheckedNotify,
        });

        toastUtils.openToastMulti({
          type: ModalTypes.SUCCESS,
          message: getSuccessMessageDeleteMultiple('folder'),
          useReskinToast: true,
        });
      } catch (error) {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          error,
          useReskinToast: true,
        });
      } finally {
        dispatch(actions.closeModal());
        batch(() => {
          setRemoveFolderList({ type: CHECKBOX_TYPE.DELETE });
          setIsDeleting(false);
        });
      }
    };
    const onRemove = () => {
      docActionsEvent.bulkActions({
        actionName: ActionName.DELETE,
        numberSelectedDocs: selectedDocList.length,
        numberSelectedFolders: selectedFolders.length,
      });
      if (selectedFolders.length) {
        const modalSetting = {
          type: ModalTypes.WARNING,
          title: t('modalFolder.deleteFolders'),
          message: t('modalFolder.messageDeleteFolders'),
          confirmButtonTitle: t('common.delete'),
          cancelButtonTitle: t('common.cancel'),
          closeOnConfirm: false,
          onConfirm: onRemoveMultipleFolder,
          onCancel: () => dispatch(actions.closeModal()),
          useReskinModal: true,
        };
        if (isInOrganizationDocument) {
          const isOverSizeLimitForNoti = totalActiveMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION;
          modalSetting.checkboxMessage = isOverSizeLimitForNoti
            ? t('modalDeleteDoc.notifyAdminThisAction')
            : t('modalDeleteDoc.notifyEveryoneThisAction');
        }
        if (selectedFolders.length > 1) {
          dispatch(actions.openModal(modalSetting));
        } else {
          openDeleteModal();
        }
        return;
      }
      let modalSettingMessage = t('modalDeleteDoc.deleteDocumentsDesc');
      if (isSharedTab) {
        modalSettingMessage = t('modalDeleteDoc.deleteSharedDocumentsDesc');
      } else if (isIndividualTab) {
        modalSettingMessage = (
          <Trans
            i18nKey="modalDeleteDoc.deletePersonalDocumentsDesc"
            components={{
              br: <br />,
              b: <b className={isEnableReskin ? 'kiwi-message--primary' : ''} />,
            }}
          />
        );
      }
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: isSharedTab ? t('modalDeleteDoc.removeTheseDocuments') : t('modalDeleteDoc.deleteTheseDocuments'),
        message: modalSettingMessage,
        confirmButtonTitle: isSharedTab ? t('common.remove') : t('common.delete'),
        cancelButtonTitle: t('common.cancel'),
        closeOnConfirm: false,
        className: 'NotedModal',
        onConfirm: onRemoveMultipleDoc,
        onCancel: () => dispatch(actions.closeModal()),
        useReskinModal: true,
      };
      if (isInOrganizationDocument) {
        const isOverSizeLimitForNoti = totalActiveMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION;
        modalSetting.checkboxMessage = isOverSizeLimitForNoti
          ? t('modalDeleteDoc.notifyAdminThisAction')
          : t('modalDeleteDoc.notifyEveryoneThisAction');
      }
      if (selectedDocList.length > 1) {
        dispatch(actions.openModal(modalSetting));
      } else {
        openDocumentModal({ mode: DocumentActions.Remove, selectedDocuments: selectedDocList });
      }
    };

    const onMove = () => openDocumentModal({ mode: DocumentActions.Move, selectedDocuments: selectedDocList });

    const onMerge = () => openDocumentModal({ mode: DocumentActions.Merge, selectedDocuments: selectedDocList });

    return (
      <WrappedComponent
        {...props}
        onRemove={onRemove}
        onMove={onMove}
        onMerge={onMerge}
      />
    );
  };

  HOC.propTypes = {
    setRemoveDocList: PropTypes.func.isRequired,
    setSelectDocMode: PropTypes.func.isRequired,
    openDocumentModal: PropTypes.func,
    setRemoveFolderList: PropTypes.func,
  };

  HOC.defaultProps = {
    openDocumentModal: () => {},
    setRemoveFolderList: () => {},
  };

  return HOC;
};
