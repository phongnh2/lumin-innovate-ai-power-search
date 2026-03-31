import PropTypes from 'prop-types';
import React from 'react';

import UploadingAvatar from 'assets/lumin-svgs/uploading-thumbnail.svg';

import { StyledThumbnail, StyledThumbnailDefault, StyledImg } from './DocumentThumbnail.styled';

const propTypes = {
  src: PropTypes.string,
  altText: PropTypes.string,
  defaultHeight: PropTypes.number,
  defaultWidth: PropTypes.number,
};

const defaultProps = {
  src: '',
  altText: '',
  defaultHeight: 18,
  defaultWidth: 14,
};

function DocumentThumbnail({
  src, altText, defaultWidth, defaultHeight,
}) {
  const renderDefaultThumbnail = () => (
    <StyledThumbnailDefault>
      <StyledImg src={UploadingAvatar} alt={altText} style={{ height: defaultHeight, width: defaultWidth }} />
    </StyledThumbnailDefault>
  );
  return <StyledThumbnail src={src} alt={altText} unloader={renderDefaultThumbnail()} />;
}
DocumentThumbnail.propTypes = propTypes;
DocumentThumbnail.defaultProps = defaultProps;

export default DocumentThumbnail;
