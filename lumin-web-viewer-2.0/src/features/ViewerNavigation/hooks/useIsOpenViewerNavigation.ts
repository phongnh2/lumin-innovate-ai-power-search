import { useSelector } from 'react-redux';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { viewerNavigationSelectors } from '../slices';

export const useIsOpenViewerNavigation = () => {
  const isViewerNavigationExpanded = useSelector(viewerNavigationSelectors.isExpanded);
  const currentUser = useGetCurrentUser();

  return isViewerNavigationExpanded && !!currentUser;
};
