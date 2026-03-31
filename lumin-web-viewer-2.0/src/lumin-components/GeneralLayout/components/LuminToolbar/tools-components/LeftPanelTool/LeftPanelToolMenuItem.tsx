import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LEFT_PANEL_VALUES, TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import useLeftPanel from '@new-ui/components/LuminLeftPanel/useLeftPanel';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';

import { readAloudActions, readAloudSelectors } from 'features/ReadAloud/slices';

interface ILeftPanelToolMenuItemProps {
  value: string;
  title: string;
  icon: string;
  isDisabled: boolean;
}

const LeftPanelToolMenuItem = ({ value, title, icon, isDisabled }: ILeftPanelToolMenuItemProps) => {
  const dispatch = useDispatch();
  const { openLeftPanel } = useLeftPanel();
  const bookmarks = useSelector(selectors.getBookmarks);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);

  const onClickMenuItem = () => {
    if (isPageEditMode) {
      core.disableReadOnlyMode();
    }
    if (isInReadAloudMode) {
      dispatch(readAloudActions.setIsInReadAloudMode(false));
    }
    if (isDisabled) {
      dispatch(actions.setIsToolPropertiesOpen(false));
      dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT));
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
    }
    openLeftPanel(value);
  };

  if (bookmarks.length === 0 && value === LEFT_PANEL_VALUES.BOOKMARK) {
    return null;
  }

  return (
    <MenuItem
      data-lumin-btn-name={value}
      leftIconProps={{ type: icon, size: 'lg' }}
      onClick={withExitFormBuildChecking(
        handlePromptCallback({
          callback: onClickMenuItem,
        })
      )}
    >
      {title}
    </MenuItem>
  );
};

export default LeftPanelToolMenuItem;
