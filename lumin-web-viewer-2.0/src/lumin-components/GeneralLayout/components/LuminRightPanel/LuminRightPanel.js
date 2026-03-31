import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import RightPanelContent from './components/RightPanelContent';

import * as Styled from './LuminRightPanel.styled';

const LuminRightPanel = () => {
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);

  return (
    <Styled.RightPanelWrapper $show={isRightPanelOpen && !isInPresenterMode} data-cy="right_panel">
      <Styled.RightPanelContent id="right-panel-content" $show={isRightPanelOpen}>
        <RightPanelContent />
      </Styled.RightPanelContent>
    </Styled.RightPanelWrapper>
  );
};

export default LuminRightPanel;
