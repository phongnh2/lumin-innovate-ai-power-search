import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import UserEventConstants from 'constants/eventConstants';

import { getShortcut } from '../utils';

const RedoTool = ({ isElementDisabled, careTaker }) => {
  const { t: translator } = useTranslation();

  return (
    <SingleButton
      onClick={handlePromptCallback({ callback: () => careTaker.redoAnnotation(), translator })}
      disabled={isElementDisabled}
      icon="md_redo"
      iconSize={24}
      eventTrackingName={UserEventConstants.Events.HeaderButtonsEvent.REDO}
      tooltipData={{
        location: 'bottom',
        title: translator('annotation.redo'),
        shortcut: getShortcut('redo'),
      }}
    />
  );
};

RedoTool.propTypes = {
  isElementDisabled: PropTypes.bool,
  careTaker: PropTypes.object,
};

RedoTool.defaultProps = {
  careTaker: {},
  isElementDisabled: true,
};

const mapStateToProps = (state) => ({
  isElementDisabled: selectors.isElementDisabled(state, 'redoButton'),
  careTaker: selectors.getCareTaker(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RedoTool);
