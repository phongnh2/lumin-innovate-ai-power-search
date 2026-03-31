import PropTypes from 'prop-types';
import React from 'react';
import { connect, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useEnableViewerNavigation } from 'features/ViewerNavigation';

import TitleBarLeftSection from './components/TitleBarLeftSection';
import TitleBarRightSection from './components/TitleBarRightSection';
import { TOOL_PROPERTIES_VALUE } from '../LuminLeftPanel/constants';

import * as Styled from './LuminTitleBar.styled';

const LuminTitleBar = ({ toolPropertiesValue }) => {
  const isInFocusMode = useSelector(selectors.isInFocusMode);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const isDocumentRevision = toolPropertiesValue === TOOL_PROPERTIES_VALUE.REVISION;
  const { enabledViewerNavigation } = useEnableViewerNavigation();
  return (
    <Styled.Header
      data-shift-right={enabledViewerNavigation}
      id="titleBar"
      $isDocumentRevision={isDocumentRevision}
      $isInFocusMode={isInFocusMode}
      $isInPresenterMode={isInPresenterMode}
    >
      <TitleBarLeftSection />

      <TitleBarRightSection />
    </Styled.Header>
  );
};

LuminTitleBar.propTypes = {
  toolPropertiesValue: PropTypes.string,
};

LuminTitleBar.defaultProps = {
  toolPropertiesValue: TOOL_PROPERTIES_VALUE.DEFAULT,
};

const mapStateToProps = (state) => ({
  toolPropertiesValue: selectors.toolPropertiesValue(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(LuminTitleBar);
