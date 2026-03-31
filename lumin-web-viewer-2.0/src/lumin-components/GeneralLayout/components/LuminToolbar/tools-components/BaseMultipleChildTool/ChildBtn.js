import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import IconButton from 'luminComponents/GeneralLayout/general-components/IconButton';

import { getDataWithKey, mapToolNameToKey } from 'constants/map';

import { getShortcut } from '../../utils';

const getColor = ({ style, isActive, toolName }) => {
  if (!isActive) {
    return '';
  }
  const { iconColor } = getDataWithKey(mapToolNameToKey(toolName));
  return style?.[iconColor]?.toHexString?.();
};

export const ChildBtn = ({
  toolName,
  toolButtonObject,
  onClick,
  activeToolName,
  activeToolStyles,
  transToolName,
  shortcutKey
}) => {
  const isToolActive = useMemo(() => toolName === activeToolName, [toolName, activeToolName]);

  return (
    <IconButton
      active={isToolActive}
      onClick={() => onClick({ dataElement: toolButtonObject.dataElement, toolName })}
      icon={toolButtonObject.newIcon}
      iconSize={24}
      iconColor={getColor({ toolName, isActive: isToolActive, style: activeToolStyles })}
      tooltipData={{
        location: 'bottom',
        title: transToolName,
        shortcut: getShortcut(shortcutKey)
      }}
    />
  );
};

ChildBtn.propTypes = {
  transToolName: PropTypes.string.isRequired,
  shortcutKey: PropTypes.string.isRequired,
  toolButtonObject: PropTypes.object.isRequired,
  toolName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  activeToolName: PropTypes.string.isRequired,
  activeToolStyles: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { toolName }) => ({
  activeToolName: selectors.getActiveToolName(state),
  activeToolStyles: selectors.getActiveToolStyles(state),
  toolButtonObject: selectors.getToolButtonObject(state, toolName),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChildBtn);
