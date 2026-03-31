import { Modal } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import selectors from 'selectors';
import { store } from 'store';

import { useTranslation } from 'hooks/useTranslation';

import useSyncThirdParty from 'features/Annotation/hooks/useSyncThirdParty';
import { openCopyDocumentModal } from 'features/CopyDocumentModal';
import { setIsExceedQuotaExternalStorage } from 'features/QuotaExternalStorage/slices';

import { STORAGE_TYPE_DESC } from 'constants/lumin-common';

import styles from './UnableSyncDocument.module.scss';

const UnableSyncDocument = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDocument = selectors.getCurrentDocument(store.getState());
  const { handleSyncThirdParty } = useSyncThirdParty();

  return (
    <Modal
      opened
      centered
      size="sm"
      cancelButtonProps={{
        title: t('viewer.exceedQuotaExternalStorage.retry'),
        variant: 'text',
      }}
      confirmButtonProps={{
        title: t('viewer.exceedQuotaExternalStorage.copyToLumin'),
        type: 'submit',
      }}
      onConfirm={() => {
        dispatch(setIsExceedQuotaExternalStorage(false));
        dispatch(openCopyDocumentModal(currentDocument));
      }}
      onCancel={async () => {
        dispatch(setIsExceedQuotaExternalStorage(false));
        await handleSyncThirdParty();
      }}
      onClose={() => {
        dispatch(setIsExceedQuotaExternalStorage(false));
      }}
      title={t('viewer.exceedQuotaExternalStorage.title')}
    >
      <div className={styles.message}>
        <p>
          {t('viewer.exceedQuotaExternalStorage.message', {
            storage: STORAGE_TYPE_DESC[currentDocument.service as keyof typeof STORAGE_TYPE_DESC],
          })}
        </p>
        <p>{t('viewer.exceedQuotaExternalStorage.description')}</p>
      </div>
    </Modal>
  );
};

export default UnableSyncDocument;
