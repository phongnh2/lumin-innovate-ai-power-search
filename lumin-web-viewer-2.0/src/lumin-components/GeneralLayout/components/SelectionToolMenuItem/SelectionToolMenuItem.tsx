import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { ToolName } from 'core/type';
import MenuItemShortcut from 'ui/components/MenuItemShortcut';

import { useTranslation } from 'hooks/useTranslation';

import { TOOLS_NAME } from 'constants/toolsName';

import { useToggleSelectionTools } from './hooks/useToggleSelectionTools';
import { getShortcut } from '../LuminToolbar/utils';

interface SelectionToolMenuItemProps {
  i18nKey: string;
  toolName: ToolName;
  icon: React.ReactNode;
}

const SelectionToolMenuItem = ({ i18nKey, icon, toolName }: SelectionToolMenuItemProps) => {
  const { t } = useTranslation();
  const { onClick } = useToggleSelectionTools();

  return (
    <MenuItem
      leftSection={icon}
      rightSection={<MenuItemShortcut shortcut={getShortcut(toolName === TOOLS_NAME.EDIT ? 'escape' : 'pan')} />}
      onClick={() => onClick(toolName)}
    >
      {t(i18nKey)}
    </MenuItem>
  );
};

export default SelectionToolMenuItem;
