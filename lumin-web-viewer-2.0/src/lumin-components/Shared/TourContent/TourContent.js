import React from 'react';
import PropTypes from 'prop-types';

import { useTabletMatch } from 'hooks';
import * as Styled from './TourContent.styled';

const propTypes = {
  image: PropTypes.string,
  alt: PropTypes.string,
  title: PropTypes.string,
  content: PropTypes.string,
};

const defaultProps = {
  image: '',
  alt: '',
  title: '',
  content: '',
};

function TourContent({ image, alt, title, content }) {
  const tabletMatch = useTabletMatch();

  return (
    <Styled.Container>
      {tabletMatch && <Styled.ImageStep src={image} alt={alt} />}
      <Styled.Title>{title}</Styled.Title>
      <Styled.Content>{content}</Styled.Content>
    </Styled.Container>
  );
}

TourContent.propTypes = propTypes;
TourContent.defaultProps = defaultProps;

export default TourContent;
