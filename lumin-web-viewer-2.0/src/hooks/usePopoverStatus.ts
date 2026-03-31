import { useSelector } from 'react-redux';

import { leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';

import selectors from 'selectors';
import { RootState } from 'store';

import { DataElements } from 'constants/dataElement';

export const usePopoverStatus = (): boolean => {
  const isToolbarPopoverOpen = useSelector((state: RootState) =>
    selectors.isElementOpen(state, DataElements.TOOLBAR_POPOVER as string)
  );
  const isLeftSidebarPopoverOpen = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);

  return isToolbarPopoverOpen || isLeftSidebarPopoverOpen;
};
