import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import BaseStylePaletteTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/BaseStylePaletteTool';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { useEnabledFreeTextToolbar } from 'features/FreeTextToolbar/hooks/useEnabledFreeTextToolbar';

import { DataElements } from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';
import { getShortcut, StaticShortcutID, switchTool } from '../utils';

interface FreeTextToolProps {
  toolName: string;
  isToolAvailable: boolean;
  toggleCheckPopper: () => void;
}

const FreeTextTool = (props: FreeTextToolProps) => {
  const { toolName, isToolAvailable, toggleCheckPopper } = props;
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { enabled: isEnabledFreeTextToolbar } = useEnabledFreeTextToolbar();
  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const activeToolStyles = useSelector(selectors.getActiveToolStyles);
  const activeToolName = useShallowSelector(selectors.getActiveToolName);

  const isToolActive = activeToolName === toolName;
  const textColor = activeToolStyles.TextColor as Core.Annotations.Color;

  const onBtnClick = () => {
    if (isToolAvailable) {
      switchTool({
        isActive: isToolActive,
        toolName: TOOLS_NAME.FREETEXT,
        eventElementName: UserEventConstants.Events.HeaderButtonsEvent.FREE_TEXT,
      });
    } else {
      toggleCheckPopper();
    }
  };

  const singleButtonProps = {
    iconSize: 24,
    icon: 'md_text_tool',
    isActive: isToolActive,
    label: t('action.type'),
    dataElement: DataElements.FREETEXT_TOOL_BUTTON,
    iconColor: isToolActive && textColor ? textColor.toHexString() : '',
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.FREE_TEXT,
    tooltipProps: { position: 'bottom', content: t('action.type'), shortcut: getShortcut(StaticShortcutID.FreeText) },
    onClick: onBtnClick,
  };

  if (!isEnabledFreeTextToolbar) {
    return <BaseStylePaletteTool shortcutId={StaticShortcutID.FreeText} forTool={TOOLS_NAME.FREETEXT} {...props} />;
  }

  return (
    <ToolbarRightSectionItem
      isSingleButton
      toolName={toolName}
      renderAsMenuItem={renderAsMenuItem}
      buttonProps={singleButtonProps}
    />
  );
};

export default withValidUserCheck(FreeTextTool, TOOLS_NAME.FREETEXT);
