import { Menu } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import { LEFT_SIDE_BAR_MENUS } from '@new-ui/components/LuminLeftSideBar/constants';
import { ILeftSideBarElementProps } from '@new-ui/components/LuminLeftSideBar/interfaces';
import { leftSideBarActions, leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';
import { getShortcut } from '@new-ui/components/LuminToolbar/utils';

import selectors from 'selectors';

import NavigationButton from 'luminComponents/ViewerCommonV2/NavigationButton';
import {
  DELAY_TIME_BY_HOVERING_NAVIGATION_TAB,
  MENU_FADE_IN_RIGHT_DURATION,
} from 'luminComponents/ViewerCommonV2/NavigationButton/constants';

import { useTranslation } from 'hooks/useTranslation';

import QuickSearch from 'features/QuickSearch';
import { quickSearchSelectors, setIsOpenQuickSearch } from 'features/QuickSearch/slices';

interface QuickSearchNavigationButtonProps {
  hoveredToolbarValue: string;
  onClickNavigationButton: (toolValue: string) => boolean;
}

const QuickSearchNavigationButton = ({
  hoveredToolbarValue,
  onClickNavigationButton,
}: QuickSearchNavigationButtonProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isInFocusMode = useSelector(selectors.isInFocusMode);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);
  const hoveredNavigationTabs = useSelector(leftSideBarSelectors.hoveredNavigationTabs);

  const { icon, label, value }: ILeftSideBarElementProps = LEFT_SIDE_BAR_MENUS.QUICK_SEARCH;

  const onClick = () => {
    dispatch(setIsOpenQuickSearch(!isOpenQuickSearch));
  };

  const onHoveringNavigationTab = useDebouncedCallback(() => {
    if (hoveredNavigationTabs.includes(value)) {
      return;
    }

    if (!isOpenQuickSearch) {
      dispatch(setIsOpenQuickSearch(true));
    }

    dispatch(leftSideBarActions.setHoveredNavigationTabs(value));
  }, DELAY_TIME_BY_HOVERING_NAVIGATION_TAB);

  const onCloseMenu = () => {
    dispatch(setIsOpenQuickSearch(false));
    dispatch(leftSideBarActions.setHoveredNavigationTabs(null));
  };

  return (
    <Menu
      width={336}
      position="left"
      trigger="click"
      offset={{ mainAxis: 5 }}
      opened={isOpenQuickSearch}
      transitionProps={{
        transition: 'fade-right',
        duration: MENU_FADE_IN_RIGHT_DURATION,
      }}
      onClose={onCloseMenu}
      ComponentTarget={
        <NavigationButton
          icon={icon}
          iconSize={24}
          label={t(label)}
          disabled={isInFocusMode}
          isActive={isOpenQuickSearch}
          tooltipData={{
            position: 'left-end',
            shortcut: getShortcut('quickSearch'),
            content: t('viewer.quickSearch.navigationBar.tooltip'),
          }}
          isHovered={hoveredToolbarValue === value}
          onClick={onClick}
          onMouseEnter={onHoveringNavigationTab}
          onMouseLeave={() => {
            onHoveringNavigationTab.cancel();
          }}
        />
      }
    >
      <QuickSearch onClickNavigationButton={onClickNavigationButton} />
    </Menu>
  );
};

export default QuickSearchNavigationButton;
