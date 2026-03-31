import React from 'react';
import PropTypes from 'prop-types';

import { getFileService } from 'utils';
import DefaultThumbnail from 'assets/lumin-svgs/default-template.svg';

import * as Styled from './TemplateItem.styled';

function TemplateThumbnail({
  thumbnail,
  name,
}) {
  if (!thumbnail) {
    return <Styled.DefaultThumbnail src={DefaultThumbnail} alt={name} />;
  }
  const src = getFileService.getThumbnailUrl(thumbnail);
  return (
    <Styled.Thumbnail src={src} alt={name} key={src} />
  );
}

TemplateThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  name: PropTypes.string.isRequired,
};
TemplateThumbnail.defaultProps = {
  thumbnail: null,
};

export default TemplateThumbnail;
