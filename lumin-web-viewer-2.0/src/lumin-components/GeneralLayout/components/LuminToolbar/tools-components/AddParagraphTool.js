import PropTypes from 'prop-types';
import React from 'react';
import { connect, useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import UserEventConstants from 'constants/eventConstants';
import TOOLS_NAME from 'constants/toolsName';

const AddParagraphTool = ({ activeToolName }) => {
  const { t } = useTranslation();
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);
  const onClick = (toolName) => {
    core.setToolMode(toolName);
  };

  return (
    <SingleButton
      icon="md_add_paragraph"
      iconSize={24}
      eventTrackingName={UserEventConstants.Events.HeaderButtonsEvent.ADD_PARAGRAPH}
      tooltipData={{ location: 'bottom', title: t('annotation.addParagraph') }}
      isActive={activeToolName === TOOLS_NAME.ADD_PARAGRAPH}
      onClick={() => onClick(TOOLS_NAME.ADD_PARAGRAPH)}
      label={t('annotation.addParagraph')}
      disabled={isAiProcessing}
    />
  );
};

AddParagraphTool.propTypes = {
  activeToolName: PropTypes.string.isRequired,
};

AddParagraphTool.defaultProps = {};

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AddParagraphTool);
