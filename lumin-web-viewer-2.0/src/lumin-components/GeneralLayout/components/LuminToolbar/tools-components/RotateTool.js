import React from 'react';
import { connect } from 'react-redux';

import core from 'core';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import UserEventConstants from 'constants/eventConstants';

import { getShortcut } from '../utils';

const RotateTool = () => {
  const { t } = useTranslation();
  return (
    <SingleButton
      onClick={core.rotateCounterClockwise}
      icon="md_rotate_counter_clockwise"
      iconSize={24}
      tooltipData={{
        location: 'bottom',
        shortcut: getShortcut('rotate'),
        title: t('action.rotateCounterClockwise'),
      }}
      data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.ROTATE}
    />
  );
};

RotateTool.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RotateTool);
