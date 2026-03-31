import { Button, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { useSaveToThirdPartyStorageContext } from '../../hooks/useSaveToThirdPartyStorageContext';

import styles from './SelectFolderLocation.module.scss';

type Props = {
  openGoogleFolderPicker: () => void;
};

const SelectFolderLocation = ({ openGoogleFolderPicker }: Props) => {
  const { isSubmitting, folderProperties } = useSaveToThirdPartyStorageContext();

  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.locationLabel}>{t('modal.location')}:</div>
      <div className={styles.locationContainer}>
        <Icomoon type="folder-shape-md" size="md" />
        <PlainTooltip content={folderProperties.location}>
          <div className={styles.locationName}>{folderProperties.location}</div>
        </PlainTooltip>
      </div>
      <div className={styles.divider} />
      <Button size="sm" variant="text" onClick={openGoogleFolderPicker} loading={isSubmitting}>
        {t('common.change')}
      </Button>
    </div>
  );
};

export default SelectFolderLocation;
