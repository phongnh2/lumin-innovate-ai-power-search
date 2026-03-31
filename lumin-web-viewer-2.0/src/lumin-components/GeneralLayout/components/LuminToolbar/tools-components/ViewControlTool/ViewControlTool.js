import React from 'react';
import { connect, useSelector } from 'react-redux';

import ToolbarPopover from 'lumin-components/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import { DataElements } from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';

import ViewControlToolContent from './ViewControlToolContent';

const ViewControlTool = () => {
  const { t } = useTranslation();
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);

  return (
    <ToolbarPopover
      renderPopperContent={(contentProps) => <ViewControlToolContent {...contentProps} />}
      renderChildren={({ handleShowPopper, ref, visible }) => (
        <SingleButton
          onClick={handleShowPopper}
          disabled={isAiProcessing}
          ref={ref}
          isActive={visible}
          icon="md_single_page_view"
          iconSize={24}
          showArrow
          eventTrackingName={UserEventConstants.Events.HeaderButtonsEvent.VIEW_CONTROL}
          tooltipData={{ placement: 'bottom', title: t('component.viewControlsOverlay') }}
          data-element={DataElements.VIEW_CONTROL_BUTTON}
        />
      )}
    />
  );
};

ViewControlTool.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ViewControlTool);
