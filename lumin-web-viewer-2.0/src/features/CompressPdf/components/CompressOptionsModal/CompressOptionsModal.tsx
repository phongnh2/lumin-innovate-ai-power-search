import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useEditingCompressOptions } from 'features/CompressPdf/hooks/useEditingCompressOptions';

import CheckboxOption from './CheckboxOption';
import DpiOptions from './DpiOptions';
import GroupTitle from './GroupTitle';

import styles from './CompressOptionsModal.module.scss';

const CompressOptionsModal = () => {
  const { t } = useTranslation();
  const {
    isDownSample,
    dpiImage,
    isEmbedFont,
    isSubsetFont,
    removeAnnotation,
    removeDocInfo,
    isDisabledSaveButton,
    setIsDownSample,
    setDpiImage,
    setIsEmbedFont,
    setIsSubsetFont,
    setRemoveAnnotation,
    setRemoveDocInfo,
    onSaveCompressOptions,
    onCancelEditingCompressOptions,
  } = useEditingCompressOptions();

  return (
    <div className={styles.modalWrapper}>
      <div className={styles.settings}>
        <div className={styles.settingGroup}>
          <GroupTitle label="imageSettings" />
          <CheckboxOption
            label={t('viewer.compressPdf.options.imageSettings.downSample')}
            checked={isDownSample}
            onChange={() => setIsDownSample(!isDownSample)}
          />
          <DpiOptions disabled={!isDownSample} currentDpi={dpiImage} setDpi={setDpiImage} />
        </div>
        <div className={styles.settingGroup}>
          <GroupTitle label="fontSettings" />
          <CheckboxOption
            label={t('viewer.compressPdf.options.fontSettings.embedFont')}
            checked={isEmbedFont}
            onChange={() => setIsEmbedFont(!isEmbedFont)}
          />
          <CheckboxOption
            label={t('viewer.compressPdf.options.fontSettings.subsetFont')}
            checked={isEmbedFont && isSubsetFont}
            disabled={!isEmbedFont}
            onChange={() => setIsSubsetFont(!isSubsetFont)}
          />
        </div>
        <div className={styles.settingGroup}>
          <GroupTitle label="fileDataSettings" />
          <CheckboxOption
            label={t('viewer.compressPdf.options.fileDataSettings.removeAnnotation')}
            checked={removeAnnotation}
            onChange={() => setRemoveAnnotation(!removeAnnotation)}
          />
          <CheckboxOption
            label={t('viewer.compressPdf.options.fileDataSettings.removeDocInfo')}
            checked={removeDocInfo}
            onChange={() => setRemoveDocInfo(!removeDocInfo)}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <Button size="lg" variant="outlined" onClick={onCancelEditingCompressOptions}>
          {t('common.cancel')}
        </Button>
        <Button size="lg" disabled={isDisabledSaveButton} onClick={onSaveCompressOptions}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default CompressOptionsModal;
