import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import UserEventConstants from 'constants/eventConstants';

import { getShortcut } from '../utils';

const UndoTool = ({ isElementDisabled, careTaker }) => {
  const { t: translator } = useTranslation();

  return (
    <SingleButton
      onClick={handlePromptCallback({ callback: () => careTaker.undoAnnotation(), translator })}
      disabled={isElementDisabled}
      icon="md_undo"
      iconSize={24}
      eventTrackingName={UserEventConstants.Events.HeaderButtonsEvent.UNDO}
      tooltipData={{
        location: 'bottom',
        title: translator('annotation.undo'),
        shortcut: getShortcut('undo'),
      }}
    />
  );
};

UndoTool.propTypes = {
  isElementDisabled: PropTypes.bool,
  careTaker: PropTypes.object,
};

UndoTool.defaultProps = {
  careTaker: {},
  isElementDisabled: true,
};

const mapStateToProps = (state) => ({
  isElementDisabled: selectors.isElementDisabled(state, 'undoButton'),
  careTaker: selectors.getCareTaker(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(UndoTool);
