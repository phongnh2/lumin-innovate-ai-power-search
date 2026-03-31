import { isEqual } from 'lodash';
import { useLayoutEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';

import { toolbarActions } from '@new-ui/components/LuminToolbar/slices';

import { useResponsiveToolbarForLargeScreens } from 'hooks/useDesktopMatch';

import { ToolbarRelatedWidth } from 'constants/toolbar';

interface IProps {
  numberOfToolsItem: number;
  maxRightSectionWidth: number;
  defaultRightSectionWidth: number;
}

const DEBOUNCE_DELAY = 100;

export const useCollapsingToolbar = (props: IProps) => {
  const { numberOfToolsItem, maxRightSectionWidth, defaultRightSectionWidth } = props;

  // Avoid unnecessary dispatch when resizing browser window
  const [maxRightSectionWidthDebounced] = useDebounce(maxRightSectionWidth, DEBOUNCE_DELAY);
  const dispatch = useDispatch();
  const isLargeDesktop = useResponsiveToolbarForLargeScreens();
  const previousWidthConfig = useRef({ maxRightSectionWidth: maxRightSectionWidthDebounced, defaultRightSectionWidth });

  const [isCollapsing, setIsCollapsing] = useState(true);
  const [currentCollapsed, setCurrentCollapsed] = useState<number>(0);

  useLayoutEffect(() => {
    if (
      !maxRightSectionWidthDebounced ||
      !defaultRightSectionWidth ||
      isEqual(previousWidthConfig.current, {
        maxRightSectionWidth: maxRightSectionWidthDebounced,
        defaultRightSectionWidth,
      })
    ) {
      return;
    }
    if (isLargeDesktop) {
      setCurrentCollapsed(0);
      setIsCollapsing(false);
      dispatch(toolbarActions.setIsToolbarPopoverVisible(false));
      return;
    }

    const difference = defaultRightSectionWidth - maxRightSectionWidthDebounced;
    if (difference >= maxRightSectionWidthDebounced) {
      setCurrentCollapsed(null);
      dispatch(toolbarActions.setIsToolbarPopoverVisible(true));
    } else {
      const leap = Math.ceil(difference / ToolbarRelatedWidth.COLLAPSED_DIFFERENCE);
      if (leap <= numberOfToolsItem) {
        setCurrentCollapsed(leap > 0 ? leap : 0);
        dispatch(toolbarActions.setIsToolbarPopoverVisible(false));
      }
    }
    setIsCollapsing(false);
    previousWidthConfig.current = { maxRightSectionWidth: maxRightSectionWidthDebounced, defaultRightSectionWidth };
  }, [dispatch, isLargeDesktop, numberOfToolsItem, maxRightSectionWidthDebounced, defaultRightSectionWidth]);

  return { isCollapsing, currentCollapsed };
};
