import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';
import { toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import { quickSearchSelectors } from 'features/QuickSearch/slices';

export const useDebounceNavigationPopover = ({
  defaultPopperPosition,
  closePopperCallback,
}: {
  defaultPopperPosition?: string;
  closePopperCallback: () => void;
}) => {
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);
  const isToolbarPopoverVisible = useSelector(toolbarSelectors.isToolbarPopoverVisible);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);
  const [debouncedLeftSideBarOpened, setDebouncedLeftSideBarOpened] = useState(isLeftSidebarPopoverOpened);

  const getPopperPosition = () => {
    switch (true) {
      case isOpenQuickSearch: {
        return 'right-start';
      }
      case isToolbarPopoverVisible: {
        return 'left-start';
      }
      case debouncedLeftSideBarOpened: {
        return 'right-start';
      }
      default: {
        return defaultPopperPosition;
      }
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isLeftSidebarPopoverOpened) {
      timeout = setTimeout(() => {
        setDebouncedLeftSideBarOpened(false);
      }, 250);
    } else {
      closePopperCallback();
      setDebouncedLeftSideBarOpened(true);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLeftSidebarPopoverOpened]);

  return { isToolbarPopoverVisible, popperPosition: getPopperPosition() };
};
