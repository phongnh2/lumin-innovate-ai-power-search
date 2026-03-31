import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { TOOL_PROPERTIES_VALUE } from '../LuminLeftPanel/constants';

import * as Styled from './ToolProperties.styled';

const LuminToolPropertiesContent = lazyWithRetry(() => import('./components/LuminToolPropertiesContent'));

const ToolProperties = () => {
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const isToolPropertiesOpen = useSelector(selectors.isToolPropertiesOpen);
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const isShow = isToolPropertiesOpen && !isInPresenterMode;
  return (
    <Styled.ToolPropertiesWrapper
      data-show={isShow}
      isRevision={toolPropertiesValue === TOOL_PROPERTIES_VALUE.REVISION}
    >
      <Styled.ToolPropertiesContent data-show={isShow}>
        {isToolPropertiesOpen && <LuminToolPropertiesContent />}
      </Styled.ToolPropertiesContent>
    </Styled.ToolPropertiesWrapper>
  );
};

export default ToolProperties;
