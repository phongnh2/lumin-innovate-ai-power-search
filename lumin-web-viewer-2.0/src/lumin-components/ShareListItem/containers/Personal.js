import { useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';

import { featureStoragePolicy } from 'features/FeatureConfigs';

import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { SUCCESS_MESSAGE, MESSAGE_OVER_FILE_SIZE } from 'constants/messages';

const Personal = ({
  isTransfering,
  document,
  member,
  reloadRequestList,
  children,
  handleTransferFileByCheckLuminStorage,
  openHitDocStackModal,
}) => {
  const { _id: documentId, service } = document;
  const [requestLoading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const acceptRejectBase = async ({ callback, message }) => {
    if (isTransfering || requestLoading) {
      return;
    }
    try {
      setLoading(true);
      await callback();
      await reloadRequestList();
      toastUtils.success({ message, useReskinToast: true });
    } catch (error) {
      const { code: errorCode, message: errorMessage } = errorUtils.extractGqlError(error);
      if (errorMessage === MESSAGE_OVER_FILE_SIZE) {
        return;
      }

      if (errorCode === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
        openHitDocStackModal('accept requests of');
      } else {
        toastUtils.openUnknownErrorToast();
      }
      setLoading(false);
      logger.logError({ error, message: errorMessage });
    }
  };

  const handleAccept = () =>
    acceptRejectBase({
      callback: () =>
        handleTransferFileByCheckLuminStorage(async () => {
          await documentServices.acceptRequestAccessDocument({
            documentId,
            requesterIds: [member._id],
          });
        }),
      message: t(SUCCESS_MESSAGE.APPROVE_REQUEST),
    });

  const handleReject = () =>
    acceptRejectBase({
      callback: () =>
        documentServices.rejectRequestAccessDocument({
          documentId,
          requesterIds: [member._id],
        }),
      message: t(SUCCESS_MESSAGE.REJECT_REQUEST),
    });

  const modalConfirmMoveToLumin = () => {
    const modalSettings = {
      type: ModalTypes.INFO,
      title: t('modalShare.fileWillBeMovedToLuminStorage'),
      message: t('modalShare.messageFileWillBeMovedToLuminStorage'),
      confirmButtonTitle: t('common.accept'),
      onConfirm: () => {
        handleAccept();
        dispatch(actions.closeModal());
      },
      onCancel: () => {},
    };
    dispatch(actions.openModal(modalSettings));
  };

  const beforeAccept = () => {
    if (featureStoragePolicy.externalStorages.includes(service)) {
      modalConfirmMoveToLumin();
      return;
    }

    handleAccept();
  };

  return children({
    handleAccept: beforeAccept,
    handleReject,
    requestLoading,
  });
};

export default Personal;
