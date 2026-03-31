import { Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import { getFileService } from 'utils';

import styles from './UploadingPopperItem.module.scss';

type UploadingPopperItemThumbnailProps = {
  thumbnail: string;
};

const UploadingPopperItemThumbnail = ({ thumbnail: thumbnailProp }: UploadingPopperItemThumbnailProps) => {
  const thumbnail =
    typeof thumbnailProp === 'string'
      ? getFileService.getThumbnailUrl(thumbnailProp)
      : thumbnailProp && window.URL.createObjectURL(thumbnailProp);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      if (thumbnail) {
        window.URL.revokeObjectURL(thumbnail);
      }
    };
  }, [thumbnail]);

  return (
    <div className={styles.thumbnailWrapper}>
      {thumbnail ? (
        <img className={styles.thumbnail} src={thumbnail} alt="thumbnail" />
      ) : (
        <Icomoon type="file-filled-lg" size="xl" color="var(--kiwi-colors-custom-role-web-thumbnail-blue)" />
      )}
    </div>
  );
};

export default React.memo(UploadingPopperItemThumbnail);
