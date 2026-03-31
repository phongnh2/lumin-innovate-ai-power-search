import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import styles from './UploadingPopperStatusBar.module.scss';

const UploadingPopperStatusBar = () => {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const { uploading: uploadingAmount } = useSelector(selectors.getUploadingDocumentsStat);

  const handleCancelAll = () => {
    dispatch(actions.cancelAllUploadingFiles());
  };
  return (
    <div className={styles.container} data-display={Boolean(uploadingAmount)}>
      <Text color="var(--kiwi-colors-core-on-primary-container)" size="sm" type="body">
        {t('uploadPopup.fileRemaining', { numOfRemaining: uploadingAmount })}
      </Text>
      <Text
        className={styles.cancelBtn}
        color="var(--kiwi-colors-core-secondary)"
        size="md"
        type="label"
        data-disabled={false}
        onClick={handleCancelAll}
      >
        {t('uploadPopup.cancelUpload')}
      </Text>
    </div>
  );
};

export default React.memo(UploadingPopperStatusBar);
