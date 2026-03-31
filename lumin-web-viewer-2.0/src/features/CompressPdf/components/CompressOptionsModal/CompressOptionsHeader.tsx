import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useTranslation } from 'hooks/useTranslation';

import { compressPdfActions } from 'features/CompressPdf/slices';

import styles from './CompressOptionsModal.module.scss';

const CompressOptionsHeader = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onCloseCompressOptionsModal = () => {
    dispatch(compressPdfActions.setIsEditingCompressOptions(false));
  };

  return (
    <div className={styles.header}>
      <IconButton
        className={styles.headerCloseButton}
        icon="ph-arrow-left"
        size="lg"
        onClick={onCloseCompressOptionsModal}
      />
      <Text className={styles.headerTitle} type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {t('viewer.compressPdf.options.title')}
      </Text>
    </div>
  );
};

export default CompressOptionsHeader;
