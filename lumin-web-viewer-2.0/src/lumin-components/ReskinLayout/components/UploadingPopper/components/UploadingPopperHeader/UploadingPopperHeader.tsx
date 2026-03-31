import { Text, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { ModalTypes } from 'constants/lumin-common';

import styles from './UploadingPopperHeader.module.scss';

type UploadingPopperHeaderProps = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
};

const UploadingPopperHeader = ({ isCollapsed, toggleCollapse }: UploadingPopperHeaderProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    completed: completedAmount,
    failed: failedAmount,
    uploading: uploadingAmount,
  } = useSelector(selectors.getUploadingDocumentsStat);

  const headerText = useMemo(() => {
    const successStatus = completedAmount ? `${completedAmount}${t('uploadPopup.textCompleted', { text: '' })}` : '';
    const failStatus = failedAmount ? `${failedAmount}${t('uploadPopup.textFailed', { text: '' })}` : '';
    const uploadingStatus = t('uploadPopup.uploadingFile', { numOfRemaining: uploadingAmount });

    if (uploadingAmount > 0) {
      return completedAmount > 0 ? [uploadingStatus, successStatus].filter(Boolean).join(', ') : uploadingStatus;
    }

    return [successStatus, failStatus].filter(Boolean).join(', ');
  }, [completedAmount, failedAmount, uploadingAmount]);

  const handleCancelAll = () => {
    dispatch(actions.cancelAllUploadingFiles());
    dispatch(actions.resetUploadingState());
  };

  const onClose = () => {
    if (uploadingAmount === 0) {
      handleCancelAll();
      return;
    }

    dispatch(
      actions.openModal({
        type: ModalTypes.WARNING,
        title: t('uploadPopup.cancelAllUploads'),
        message: t('uploadPopup.messageCancelAllUploads'),
        confirmButtonTitle: t('uploadPopup.cancelUpload'),
        cancelButtonTitle: t('uploadPopup.continueUpload'),
        onConfirm: handleCancelAll,
        onCancel: () => {},
        useReskinModal: true,
      })
    );
  };

  return (
    <div className={styles.container}>
      <Text type="headline" size="sm" color="var(--kiwi-colors-core-on-primary)">
        {headerText}
      </Text>
      <div className={styles.actionButtons}>
        <IconButton
          aria-description="collapes-expand"
          size="md"
          icon="chevron-down-md"
          iconColor="var(--kiwi-colors-core-on-primary)"
          data-collapsed={isCollapsed}
          onClick={toggleCollapse}
        />
        <IconButton
          aria-description="close"
          size="md"
          icon="x-md"
          iconColor="var(--kiwi-colors-core-on-primary)"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default React.memo(UploadingPopperHeader);
