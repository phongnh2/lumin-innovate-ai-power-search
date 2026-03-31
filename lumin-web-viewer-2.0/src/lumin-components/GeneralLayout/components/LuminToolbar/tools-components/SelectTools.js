import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import UserEventConstants from 'constants/eventConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToggleSelectionTools } from '../../SelectionToolMenuItem/hooks/useToggleSelectionTools';
import { getShortcut } from '../utils';

const SelectTools = ({ activeToolName }) => {
  const { t } = useTranslation();
  const { onClick } = useToggleSelectionTools();

  return (
    <>
      <SingleButton
        icon="md_cursor"
        iconSize={24}
        tooltipData={{ location: 'bottom', title: t('tool.select'), shortcut: getShortcut('escape') }}
        isActive={activeToolName === TOOLS_NAME.EDIT}
        onClick={() => onClick(TOOLS_NAME.EDIT)}
      />

      <SingleButton
        icon="md_pan"
        iconSize={24}
        eventTrackingName={UserEventConstants.Events.HeaderButtonsEvent.PAN_TOOL}
        tooltipData={{ location: 'bottom', title: t('tool.pan'), shortcut: getShortcut('pan') }}
        isActive={activeToolName === TOOLS_NAME.PAN}
        onClick={() => onClick(TOOLS_NAME.PAN)}
      />
    </>
  );
};

SelectTools.propTypes = {
  activeToolName: PropTypes.string.isRequired,
};

SelectTools.defaultProps = {};

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SelectTools);
