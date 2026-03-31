import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import { useTranslation } from 'hooks';

import DateTimeFormItem from './formItems/DateTimeFormItem';
import { drawInCanvas } from '../../utils';

import * as Styled from './RubberStampPreview.styled';

const RubberStampPreview = ({ collectedData }) => {
  const canvasRef = useRef();
  const canvasContainerRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    drawInCanvas(collectedData, canvasRef.current, canvasContainerRef.current);
  }, [collectedData]);

  return (
    <Styled.Container data-new-layout>
      <Styled.Header data-new-layout>
        <Styled.HeaderTitle data-new-layout>{t('viewer.stamp.preview')}</Styled.HeaderTitle>
        <Styled.HeaderDateTime>
          <DateTimeFormItem />
        </Styled.HeaderDateTime>
      </Styled.Header>
      <Styled.PreviewBody data-new-layout>
        <div className="canvas-container" ref={canvasContainerRef}>
          <Styled.Canvas className="custom-stamp-canvas" ref={canvasRef} />
        </div>
      </Styled.PreviewBody>
    </Styled.Container>
  );
};

RubberStampPreview.propTypes = { collectedData: PropTypes.object };
RubberStampPreview.defaultProps = { collectedData: {} };

export default RubberStampPreview;
