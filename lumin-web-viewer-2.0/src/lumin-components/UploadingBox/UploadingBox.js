import React from 'react';
import PropTypes from 'prop-types';

import UploadingBoxHeader from './components/UploadingBoxHeader';
import UploadingBoxBody from './components/UploadingBoxBody';
import * as Styled from './UploadingBox.styled';

const UploadingBox = ({ isCollapse, setCollapse }) => (
  <Styled.Container>
    <Styled.Wrapper>
      <UploadingBoxHeader isCollapse={isCollapse} setCollapse={setCollapse} />
      <UploadingBoxBody isCollapse={isCollapse} />
    </Styled.Wrapper>
  </Styled.Container>
);

UploadingBox.propTypes = {
  isCollapse: PropTypes.bool,
  setCollapse: PropTypes.func,
};

UploadingBox.defaultProps = {
  setCollapse: () => {},
  isCollapse: false,
};

export default UploadingBox;
