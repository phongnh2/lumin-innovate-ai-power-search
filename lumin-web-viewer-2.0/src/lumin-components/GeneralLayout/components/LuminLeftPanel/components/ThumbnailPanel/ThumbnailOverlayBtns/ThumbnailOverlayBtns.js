import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Remove from './components/Remove';
import RotateClockwise from './components/RotateClockwise';
import RotateCounterClockwise from './components/RotateCounterClockwise';
import * as Styled from '../ThumbnailPanel.styled';

const ThumbnailOverlayBtns = ({ index }) => {
  const isAnnotationsLoaded = useSelector(selectors.getAnnotationsLoaded);
  if (!isAnnotationsLoaded) {
    return null;
  }
  return (
    <Styled.ThumbnailOverlayBtns>
      <Styled.ThumbnailOverlayBtnWrapper>
        <RotateCounterClockwise index={index} />
      </Styled.ThumbnailOverlayBtnWrapper>

      <Styled.ThumbnailOverlayBtnWrapper>
        <RotateClockwise index={index} />
      </Styled.ThumbnailOverlayBtnWrapper>

      <Styled.ThumbnailOverlayBtnWrapper>
        <Remove index={index} />
      </Styled.ThumbnailOverlayBtnWrapper>
    </Styled.ThumbnailOverlayBtns>
  );
};

ThumbnailOverlayBtns.propTypes = {
  index: PropTypes.number.isRequired,
};

export default ThumbnailOverlayBtns;
