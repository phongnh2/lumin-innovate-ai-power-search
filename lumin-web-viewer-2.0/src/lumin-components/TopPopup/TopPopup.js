import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './TopPopup.styled';

const propTypes = {
  text: PropTypes.node,
  isOpen: PropTypes.bool,
};
const defaultProps = {
  text: '',
  isOpen: false,
};

function TopPopup({ isOpen, text }) {
  return (
    <Styled.Wrapper>
      <Styled.Container isOpen={isOpen}>{text}</Styled.Container>
    </Styled.Wrapper>
  );
}

TopPopup.propTypes = propTypes;
TopPopup.defaultProps = defaultProps;

export default TopPopup;
