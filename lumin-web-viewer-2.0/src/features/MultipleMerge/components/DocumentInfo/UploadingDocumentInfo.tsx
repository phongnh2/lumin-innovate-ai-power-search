import classNames from 'classnames';
import { Icomoon } from 'lumin-ui/kiwi-ui';
import React, { memo } from 'react';

import { useTranslation } from 'hooks';

import styles from './DocumentInfo.module.scss';

type Props = {
  thumbnail?: string;
  name: string;
};

const UploadingDocumentInfo = ({ thumbnail, name }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      {thumbnail ? (
        <img src={thumbnail} alt="Document Thumbnail" className={styles.thumbnail} />
      ) : (
        <Icomoon type="file-filled-lg" size="lg" color="var(--kiwi-colors-custom-role-web-thumbnail-blue)" />
      )}
      <div className={styles.documentNameAndSize}>
        <p className={classNames([styles.name, styles.uploadingName])}>{name}</p>
        <div className={styles.extraInfoContainer}>
          <p className={classNames([styles.extraInfo, styles.uploadingExtraInfo])}>{t('multipleMerge.uploading')}</p>
          <div className={styles.progressBar}>
            <div className={styles.progressBarValue} />
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(UploadingDocumentInfo);
