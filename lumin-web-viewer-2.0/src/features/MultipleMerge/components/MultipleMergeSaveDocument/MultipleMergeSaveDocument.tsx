import { Icomoon } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';

import { useRestrictedUser } from 'hooks/useRestrictedUser';
import { useTranslation } from 'hooks/useTranslation';

import SaveToDriveFormContent from 'features/SaveToThirdPartyStorage/components/SaveToThirdPartyStorageFormContent';

import { SAVE_DESTINATION_OPTIONS, SAVE_DOCUMENT_FORMAT_LIST } from '../../constants';
import { SaveDestination } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import SaveDestinationItem from '../SaveDestinationItem/SaveDestinationItem';

import styles from './MultipleMergeSaveDocument.module.scss';

const MultipleMergeSaveDocument = () => {
  const { t } = useTranslation();
  const { saveDestination, setSaveDestination, openSaveToDriveModal } = useMultipleMergeContext();
  const { isDriveOnlyUser } = useRestrictedUser();

  const validSaveDestinationOptions = SAVE_DESTINATION_OPTIONS.filter(
    (option) => !isDriveOnlyUser || option.type !== SaveDestination.LUMIN
  );

  if (openSaveToDriveModal) {
    return <SaveToDriveFormContent />;
  }

  return (
    <>
      <p className={styles.label}>{t('multipleMerge.saveTo')}</p>
      <div className={styles.saveDestinationContainer}>
        {validSaveDestinationOptions.map((option, index) => (
          <div key={index} className={styles.saveDestinationItemContainer}>
            {option.type === saveDestination && (
              <motion.div className={styles.saveDestinationBackground} layoutId="background" id="background" />
            )}
            <SaveDestinationItem setSaveDestination={setSaveDestination} {...option} />
          </div>
        ))}
      </div>
      <p className={styles.label}>{t('multipleMerge.format')}</p>
      <div className={styles.documentFormatContainer}>
        <Icomoon type={SAVE_DOCUMENT_FORMAT_LIST[0].icon} size="lg" color="var(--kiwi-colors-surface-on-surface)" />
        <p className={styles.documentFormat}>{t(SAVE_DOCUMENT_FORMAT_LIST[0].contentKey)}</p>
      </div>
    </>
  );
};

export default MultipleMergeSaveDocument;
