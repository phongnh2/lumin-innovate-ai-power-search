import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import { leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';

import selectors from 'selectors';

import { documentStorage } from 'constants/documentConstants';

import { useAutoSavePageTools } from './useAutoSavePageTools';
import { useShallowSelector } from './useShallowSelector';

export const useRenderConvertFileModal = () => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const hoveredNavigationTabs = useSelector(leftSideBarSelectors.hoveredNavigationTabs);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);

  const canUseAutoSavePageTools = useAutoSavePageTools();

  const shouldOpenModal =
    currentUser && currentDocument && !canUseAutoSavePageTools && currentDocument.service === documentStorage.google;

  const shouldOpenModalWithPageToolsHovered =
    shouldOpenModal && isLeftSidebarPopoverOpened && hoveredNavigationTabs[0] === LEFT_SIDE_BAR.PAGE_TOOLS;

  return { currentDocument, shouldOpenConvertFileModal: shouldOpenModal, shouldOpenModalWithPageToolsHovered };
};
