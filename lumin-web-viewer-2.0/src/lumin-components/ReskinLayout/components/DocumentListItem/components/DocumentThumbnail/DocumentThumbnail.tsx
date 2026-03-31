import React from 'react';
import { Img } from 'react-image';

import Folder from 'assets/reskin/lumin-svgs/folder.svg';
import PDFText from 'assets/reskin/lumin-svgs/pdf-text.svg';

import styles from './DocumentThumbnail.module.scss';

export interface DocumentThumbnailProps {
  src?: string;
  altText?: string;
  isNewUpload?: boolean;
  isFolder?: boolean;
}

const DefaultThumbnail = ({ altText }: { altText: string }) => (
  <div className={styles.thumbnailDefault}>
    <img className={styles.img} src={PDFText} alt={altText} />
  </div>
);

function DocumentThumbnail({ src, altText, isNewUpload, isFolder }: DocumentThumbnailProps) {
  return (
    <div className={styles.thumbnailContainer}>
      {isNewUpload && <div className={styles.documentStatus} />}
      {isFolder ? (
        <img src={Folder} alt={altText} />
      ) : (
        <div className={styles.thumbnailWrapper}>
          <Img className={styles.thumbnail} src={src} alt={altText} unloader={<DefaultThumbnail altText={altText} />} />
        </div>
      )}
    </div>
  );
}

export default React.memo(DocumentThumbnail);
