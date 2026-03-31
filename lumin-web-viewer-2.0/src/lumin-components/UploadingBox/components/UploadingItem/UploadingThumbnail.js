import React from 'react';
import PropTypes from 'prop-types';
import { UploadUtils } from 'utils';
import UploadingAvatar from 'assets/lumin-svgs/uploading-thumbnail.svg';
import * as Styled from './UploadingItem.styled';

function UploadingThumbnail({
  thumbnail,
  status,
}) {
  const loading = [UploadUtils.UploadStatus.UPLOADING, UploadUtils.UploadStatus.PROCESSING].includes(status);
  return (
    <Styled.ThumbnailWrapper
      $loading={loading}
      $isDefault={!thumbnail}
    >
      <Styled.Thumbnail
        src={thumbnail || UploadingAvatar}
        $isDefault={!thumbnail}
      />
    </Styled.ThumbnailWrapper>
  );
}

UploadingThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  status: PropTypes.string.isRequired,
};
UploadingThumbnail.defaultProps = {
  thumbnail: null,
};

export default React.memo(UploadingThumbnail);
