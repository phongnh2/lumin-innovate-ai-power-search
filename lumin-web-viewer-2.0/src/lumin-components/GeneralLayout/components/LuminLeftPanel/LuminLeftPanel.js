import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import AppCircularLoading from 'luminComponents/AppCircularLoading';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useAddOutlineListener } from './useAddOutlineListener';

import * as Styled from './LuminLeftPanel.styled';

const LuminLeftPanelContent = lazyWithRetry(() => import('./components/LuminLeftPanelContent'), {
  fallback: <AppCircularLoading />,
});

const LuminLeftPanel = ({ isLeftPanelOpen, isInPresenterMode }) => {
  useAddOutlineListener();

  return (
    <Styled.LeftPanelWrapper show={isLeftPanelOpen && !isInPresenterMode} id="leftPanel">
      <Styled.LeftPanelContent show={isLeftPanelOpen}>
        {isLeftPanelOpen && <LuminLeftPanelContent />}
      </Styled.LeftPanelContent>
    </Styled.LeftPanelWrapper>
  );
};

LuminLeftPanel.propTypes = {
  isLeftPanelOpen: PropTypes.bool,
  isInPresenterMode: PropTypes.bool,
};

LuminLeftPanel.defaultProps = {
  isLeftPanelOpen: false,
  isInPresenterMode: false,
};

const mapStateToProps = (state) => ({
  isLeftPanelOpen: selectors.isLeftPanelOpen(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LuminLeftPanel);
