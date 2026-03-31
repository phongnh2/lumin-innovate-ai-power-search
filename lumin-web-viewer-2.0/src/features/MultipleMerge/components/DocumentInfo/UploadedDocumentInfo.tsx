import { Icomoon } from 'lumin-ui/kiwi-ui';
import React, { memo } from 'react';

import { formatDocumentSizeInMB } from '../../utils/documentFormatter';

import styles from './DocumentInfo.module.scss';

type Props = {
  thumbnail?: string;
  name: string;
  size: number;
};

const UploadedDocumentInfo = ({ thumbnail, name, size }: Props) => (
  <>
    {thumbnail ? (
      <img src={thumbnail} alt="Document Thumbnail" className={styles.thumbnail} />
    ) : (
      <Icomoon type="file-filled-lg" size="lg" color="var(--kiwi-colors-custom-role-web-thumbnail-blue)" />
    )}
    <div className={styles.documentNameAndSize}>
      <p className={styles.name}>{name}</p>
      <div className={styles.extraInfoContainer}>
        <p className={styles.extraInfo}>{formatDocumentSizeInMB(size)}</p>
      </div>
    </div>
  </>
);

export default memo(UploadedDocumentInfo);
