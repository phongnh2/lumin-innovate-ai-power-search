import classNames from 'classnames';
import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { useSaveToThirdPartyStorageContext } from 'features/SaveToThirdPartyStorage/hooks/useSaveToThirdPartyStorageContext';

import { MultipleMergeStep } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';

import styles from './MultipleMergeHeader.module.scss';

const MultipleMergeHeader = () => {
  const { t } = useTranslation();
  const { currentStep, openSaveToDriveModal, setOpenSaveToDriveModal } = useMultipleMergeContext();
  const { isSubmitting } = useSaveToThirdPartyStorageContext();

  const getHeaderTitle = () => {
    if (openSaveToDriveModal) {
      return t('multipleMerge.saveToDriveTitle');
    }

    return currentStep === MultipleMergeStep.SAVE_DOCUMENT
      ? t('multipleMerge.saveTitle')
      : t('multipleMerge.mergeTitle');
  };

  return (
    <>
      {openSaveToDriveModal && (
        <IconButton
          className={styles.backButton}
          size="lg"
          icon="ph-arrow-left"
          onClick={() => setOpenSaveToDriveModal(false)}
          disabled={isSubmitting}
        />
      )}
      <h2 className={classNames([styles.title, openSaveToDriveModal && styles.titleWithBackButton])}>
        {getHeaderTitle()}
      </h2>
    </>
  );
};

export default MultipleMergeHeader;
