import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useSelector } from 'react-redux';

import MenuItemShortcut from 'ui/components/MenuItemShortcut';

import selectors from 'selectors';
import { RootState } from 'store';

import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { DataElements } from 'constants/dataElement';

import { getShortcut } from '../LuminToolbar/utils';

interface UndoRedoMenuItemProps {
  i18nKey: string;
  elementName: string;
  icon: React.ReactNode;
  shortcutKey: string;
}

const UndoRedoMenuItem = ({ i18nKey, elementName, icon, shortcutKey }: UndoRedoMenuItemProps) => {
  const { t } = useTranslation();
  const careTaker = useSelector(selectors.getCareTaker);
  const isDisabled = useSelector((state: RootState) => selectors.isElementDisabled(state, elementName));

  const onClick = () => {
    if (elementName === DataElements.UNDO_BUTTON) {
      careTaker.undoAnnotation();
    } else {
      careTaker.redoAnnotation();
    }
  };

  return (
    <MenuItem
      disabled={isDisabled}
      leftSection={icon}
      rightSection={<MenuItemShortcut shortcut={getShortcut(shortcutKey)} />}
      onClick={handlePromptCallback({ callback: onClick, translator: t })}
    >
      {t(i18nKey)}
    </MenuItem>
  );
};

export default UndoRedoMenuItem;
