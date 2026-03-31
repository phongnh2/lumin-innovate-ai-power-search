import React from 'react';
import { Img } from 'react-image';

import PDF from 'assets/reskin/lumin-svgs/pdf-xl.svg';

import styles from './DocumentThumbnail.module.scss';

type DocumentThumbnailProps = {
  src: string;
  altText: string;
};

const DefaultThumbnail = ({ altText }: { altText: string }) => (
  <div className={styles.thumbnailDefault}>
    <img className={styles.imageFit} src={PDF} alt={altText} />
  </div>
);

function DocumentThumbnail({ src, altText }: DocumentThumbnailProps) {
  return <Img className={styles.thumbnail} src={src} alt={altText} unloader={<DefaultThumbnail altText={altText} />} />;
}

export default DocumentThumbnail;
